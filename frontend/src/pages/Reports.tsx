/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
// Required for charts
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Inside Reports component (placeholder update to remove unused variable warnings and show something real)
import { useState, useEffect } from 'react';
import api from '../api';
import { formatCurrency } from '../utils/format';

const Reports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                const [projects, expenses] = await Promise.all([
                    api.get('/projects'),
                    api.get('/expenses')
                ]);

                // aggregate by project
                const agg = projects.data.map((p: any) => {
                    const pExpenses = expenses.data.filter((e: any) => e.project_id === p.id);
                    const totalSpent = pExpenses.reduce((sum: number, e: any) => sum + e.actual_amount, 0);
                    return {
                        name: p.name,
                        予算: p.total_budget,
                        支出実績: totalSpent
                    };
                });
                setData(agg);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">レポート</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-700 mb-6">プロジェクト別 予実比較</h3>
                {loading ? (
                    <div className="text-center text-gray-400 py-10">集計中...</div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">データがありません</div>
                ) : (
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="予算" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="支出実績" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
