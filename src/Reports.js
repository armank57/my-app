import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Reports() {
    const [reportType, setReportType] = useState('user');
    const [report, setReport] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/users')
            .then(response => {
                setUsers(response.data);
                setSelectedUser('all');
            });
    }, []);

    useEffect(() => {
        let url = `http://127.0.0.1:5000/${reportType}_report`;
        if (reportType === 'user' && selectedUser !== 'all') {
            url += `?user_id=${selectedUser}`;
        }
        const response = axios.get(url)
            .then(response => {
                setReport(response.data);
            });
    }, [reportType, selectedUser]);

    const switchReport = () => {
        setReportType(reportType === 'user' ? 'post' : 'user');
        setReport([]);
    }

    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    }

    return (
        <div>
            <h1>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
            <button onClick={switchReport}>Switch Report</button>
            {reportType === 'user' && (
                <select value={selectedUser} onChange={handleUserChange}>
                    <option value = "all">All Users</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                </select>
            )}
            <table>
                <thead>
                    <tr>
                        {reportType === 'user' && (
                            <>
                                <th>User ID</th>
                                <th>Post Count</th>
                                <th>Average Upvotes</th>
                            </>
                        )}
                        {reportType === 'post' && (
                            <>
                                <th>Post ID</th>
                                <th>Comment Count</th>
                                <th>Upvotes</th>
                                <th>Average Comment Count</th>
                                <th>Average Upvotes</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {report && report.map((data, index) => (
                        <tr key={index}>
                            {reportType === 'user' && (
                                <>
                                    <td>{data.user_id}</td>
                                    <td>{data.post_count}</td>
                                    <td>{data.avg_upvotes.toFixed(2)}</td>
                                </>
                            )}
                            {reportType === 'post' && (
                                <>
                                    <td>{data.post_id}</td>
                                    <td>{data.comment_count}</td>
                                    <td>{data.upvotes}</td>
                                    <td>{data.avg_comment_count.toFixed(2)}</td>
                                    <td>{data.avg_upvotes.toFixed(2)}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Reports;