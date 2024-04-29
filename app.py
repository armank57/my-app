from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func, text

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://my-app-348final.onrender.com"]}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db' # Use a temporary database
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    posts = db.relationship('Post', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)

    def __repr__(self):
        return '<User %r>' % self.username
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    upvotes = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='post', lazy=True)

    def __repr__(self):
        return '<Post %r>' % self.title

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'user_id': self.user_id,
            'upvotes': self.upvotes
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False, index=True)

    def __repr__(self):
        return '<Comment %r>' % self.content
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'user_id': self.user_id,
            'post_id': self.post_id
        }

@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    new_user = User(username=data['username'], email=data['email'])
    with db.session.begin():
        db.session.connection(execution_options={'isolation_level': 'SERIALIZABLE'})
        db.session.add(new_user)
        db.session.commit()
    return jsonify(new_user.to_dict()), 201

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@app.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([post.to_dict() for post in posts])

@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict())

@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).all()
    return jsonify([comment.to_dict() for comment in comments])

@app.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    new_post = Post(title=data['title'], content=data['content'], user_id=data['user_id'])
    with db.session.begin():
        db.session.connection(execution_options={'isolation_level': 'SERIALIZABLE'})
        db.session.add(new_post)
        db.session.commit()
    return jsonify(new_post.to_dict()), 201

@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    with db.session.begin():
        db.session.connection(execution_options={'isolation_level': 'SERIALIZABLE'})
        data = request.get_json()
        username = data.get('username')  # get the username from the request data
        user = User.query.filter_by(username=username).first()  # find the user with that username

        post = Post.query.get_or_404(post_id)

        # if the user was not found or they are not the author of the post, return an error message
        if not user or user.id != post.user_id:
            return jsonify({'message': 'User not found or not the author of the post'}), 403

        post = Post.query.get_or_404(post_id)
        post.title = data.get('title', post.title)
        post.content = data.get('content', post.content)
        db.session.commit()
    return jsonify(post.to_dict())

@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    with db.session.begin():
        db.session.connection(execution_options={'isolation_level': 'SERIALIZABLE'})
        post = Post.query.get_or_404(post_id)

        Comment.query.filter_by(post_id=post_id).delete()

        db.session.delete(post)
        db.session.commit()
    return jsonify({'message': 'Post has been deleted'})

@app.route('/posts/<int:post_id>/upvote', methods=['POST'])
def upvote_post(post_id):
    post = Post.query.get_or_404(post_id)
    post.upvotes += 1
    db.session.commit()
    return jsonify(post.to_dict())

@app.route('/comments', methods=['POST'])
def create_comment():
    data = request.get_json()
    post_id = data['post_id']
    with db.session.begin():
        db.session.connection(execution_options={'isolation_level': 'SERIALIZABLE'})
        post = Post.query.get(post_id)
        if post is None:
            return jsonify({'message': 'Post not found'}), 404
        new_comment = Comment(content=data['content'], user_id=data['user_id'], post_id=data['post_id'])
        db.session.add(new_comment)
        db.session.commit()
    return jsonify(new_comment.to_dict()), 201

@app.route('/user_report', methods=['GET'])
def user_report():
    user_id = request.args.get('user_id')
    if user_id is not None:
        stmt = text("SELECT user.id, COUNT(post.id) AS post_count, AVG(post.upvotes) AS avg_upvotes"
                    " FROM user LEFT JOIN post ON user.id = post.user_id"
                    " WHERE user.id = :user_id"
                    " GROUP BY user.id")
        result = db.session.execute(stmt, {'user_id': user_id})
    else:
        stmt = text("SELECT user.id, COUNT(post.id) AS post_count, AVG(post.upvotes) AS avg_upvotes"
                    " FROM user LEFT JOIN post ON user.id = post.user_id"
                    " GROUP BY user.id")
        result = db.session.execute(stmt)
    user_report = []
    for row in result:
        user_report.append({
            'user_id': row[0],
            'post_count': row[1],
            'avg_upvotes': float(row[2] if row[2] is not None else 0)
        })

    return jsonify(user_report)

@app.route('/post_report', methods=['GET'])
def post_report():
    stmt = text("SELECT post.id, COUNT(comment.id) AS comment_count, post.upvotes, ("
                "    SELECT (AVG(cmt_cnt)) FROM (SELECT COUNT(*) AS cmt_cnt FROM comment GROUP BY post_id) "
                ") AS avg_comment_count, ( "
                "    SELECT AVG(upvotes) FROM post "
                ") AS avg_upvotes "
                "FROM post LEFT JOIN comment ON post.id = comment.post_id "
                "GROUP BY post.id")
    result = db.session.execute(stmt)

    post_report = []
    for row in result:
        post_report.append({
            'post_id': row[0],
            'comment_count': row[1],
            'upvotes': row[2],
            'avg_comment_count': float(row[3] if row[3] is not None else 0),
            'avg_upvotes': float(row[4] if row[4] is not None else 0)
        })

    return jsonify(post_report)

if __name__ == '__main__':
    app.run(debug=True)