/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useCategories } from '../hooks/useCategories';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

const Projects = () => {
    const { projects, loading, error, createProject } = useProjects();
    const [showForm, setShowForm] = useState(false);
    const { categories } = useCategories();

    // Form state
    const [name, setName] = useState('');
    const [termStart, setTermStart] = useState('');
    const [termEnd, setTermEnd] = useState('');
    const [totalBudget, setTotalBudget] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const toggleCategory = (catId: number) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProject({
                name,
                term_start: termStart,
                term_end: termEnd,
                total_budget: Number(totalBudget) * 10000,
                categoryIds: selectedCategories
            });
            setShowForm(false);
            setName('');
            setTermStart('');
            setTermEnd('');
            setTotalBudget('');
            setSelectedCategories([]);
        } catch (err) {
            console.error(err);
            // error handling is managed by the hook mostly, but could display a toast here
        }
    };

    if (loading && projects.length === 0) {
        return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">エラーが発生しました: {error}</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">プロジェクト管理</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    {showForm ? 'キャンセル' : '新規作成'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="text-lg font-medium mb-4">新しいプロジェクトを作成</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト名</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                placeholder="例: 2024年度 上期 開発プロジェクト"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">期開始 (年月)</label>
                                <input
                                    type="month"
                                    required
                                    value={termStart}
                                    onChange={(e) => setTermStart(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">期終了 (年月)</label>
                                <input
                                    type="month"
                                    required
                                    value={termEnd}
                                    onChange={(e) => setTermEnd(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">半期全体予算総額 (万円)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.1"
                                value={totalBudget}
                                onChange={(e) => setTotalBudget(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="例: 150.0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">使用するカテゴリ (複数選択可)</label>
                            {categories.length === 0 ? (
                                <p className="text-sm text-gray-500">共通カテゴリが登録されていません。「Categories」から登録してください。</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat.id)}
                                                onChange={() => toggleCategory(cat.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="truncate">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {projects.length === 0 && !showForm ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 text-center text-gray-500">
                        プロジェクトがまだありません。「新規作成」から追加してください。
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link to={`/projects/${project.id}`} key={project.id} className="block">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <span>{project.term_start}</span>
                                        <span className="mx-2">〜</span>
                                        <span>{project.term_end}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500">予算総額</span>
                                            <span className="text-lg font-bold text-gray-800">
                                                {formatCurrency(project.total_budget)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;
