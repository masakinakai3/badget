/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useDashboard } from '../hooks/useDashboard';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

const Dashboard = () => {
    const { metrics, loading, error } = useDashboard();

    if (loading) return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
    if (error) return <div className="p-8 text-center text-red-500">エラーが発生しました: {error}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">全プロジェクト予算総額</h3>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalBudget)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">全プロジェクト支出総額</h3>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalExpenses)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">全体予算残高</h3>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.remainingBudget)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">全体消化率</h3>
                    <p className={`text-3xl font-bold ${metrics.consumptionRate > 90 ? 'text-red-500' : 'text-purple-600'}`}>
                        {metrics.consumptionRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">プロジェクト管理へ</h3>
                <p className="text-gray-500 mb-6">
                    現在 {metrics.projectCount} 件のプロジェクトが登録されています。
                </p>
                <Link
                    to="/projects"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                >
                    プロジェクト一覧を見る
                </Link>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">プロジェクト別状況</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {metrics.projectMetrics.map(p => (
                    <Link to={`/projects/${p.id}`} key={p.id} className="block group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <h4 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">{p.name}</h4>
                                <div className="text-sm text-gray-500 mb-4">{p.term_start} 〜 {p.term_end}</div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">予算</span>
                                        <span className="font-medium text-gray-800">{formatCurrency(p.totalBudget)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">支出</span>
                                        <span className="font-medium text-red-600">{formatCurrency(p.totalExpenses)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">残高</span>
                                        <span className="font-medium text-green-600">{formatCurrency(p.remainingBudget)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-gray-500">消化率</span>
                                        <span className={`text-sm font-bold ${p.consumptionRate > 90 ? 'text-red-500' : 'text-blue-600'}`}>
                                            {p.consumptionRate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${p.consumptionRate > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                                            style={{ width: `${Math.min(p.consumptionRate, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {metrics.projectMetrics.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                        プロジェクトがありません。
                    </div>
                )}
            </div>
        </div >
    );
};

export default Dashboard;
