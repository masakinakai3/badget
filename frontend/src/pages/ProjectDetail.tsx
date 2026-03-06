/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useProject } from '../hooks/useProject';
import { useCategories } from '../hooks/useCategories';
import { ArrowLeft, Edit2 } from 'lucide-react';
import BudgetMatrix from '../components/BudgetMatrix';
import ExpenseForm from '../components/ExpenseForm';
import { formatCurrency } from '../utils/format';

const ProjectDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { project, loading: projectLoading, error: projectError, updateProject } = useProject(id);
    const { categories, loading: categoriesLoading } = useCategories();

    // Edit project state
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editProjectName, setEditProjectName] = useState('');
    const [editProjectStart, setEditProjectStart] = useState('');
    const [editProjectEnd, setEditProjectEnd] = useState('');
    const [editProjectBudget, setEditProjectBudget] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const toggleCategory = (catId: number) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const handleEditProjectClick = () => {
        if (!project) return;
        setIsEditingProject(true);
        setEditProjectName(project.name);
        setEditProjectStart(project.term_start);
        setEditProjectEnd(project.term_end);
        setEditProjectBudget((project.total_budget / 10000).toString());
        setSelectedCategories(project.categoryIds || []);
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProject({
                name: editProjectName,
                term_start: editProjectStart,
                term_end: editProjectEnd,
                total_budget: Number(editProjectBudget) * 10000,
                categoryIds: selectedCategories
            });
            setIsEditingProject(false);
        } catch (err) {
            console.error(err);
        }
    };

    if (projectLoading || categoriesLoading) return <div className="p-8 text-center">読み込み中...</div>;
    if (projectError || !project) return <div className="p-8 text-center text-red-500">プロジェクトが見つかりません</div>;

    const assignedCategories = categories.filter(c => project.categoryIds?.includes(c.id));

    return (
        <div>
            {/* Header */}
            <div className="flex items-start space-x-4 mb-8 text-gray-800">
                <Link to="/projects" className="p-2 hover:bg-gray-200 rounded-full transition-colors mt-1">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                {isEditingProject ? (
                    <form onSubmit={handleUpdateProject} className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト名</label>
                                <input required type="text" value={editProjectName} onChange={e => setEditProjectName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">期開始</label>
                                <input required type="month" value={editProjectStart} onChange={e => setEditProjectStart(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">期終了</label>
                                <input required type="month" value={editProjectEnd} onChange={e => setEditProjectEnd(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">全体予算 (万円)</label>
                                <input required type="number" step="0.1" min="0" value={editProjectBudget} onChange={e => setEditProjectBudget(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">使用するカテゴリ (複数選択可)</label>
                                {categories.length === 0 ? (
                                    <p className="text-sm text-gray-500">共通カテゴリが登録されていません。「Categories」から登録してください。</p>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {categories.map(cat => (
                                            <label key={cat.id} className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 p-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
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
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setIsEditingProject(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors">キャンセル</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">保存</button>
                        </div>
                    </form>
                ) : (
                    <div className="flex-1 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold">{project.name}</h2>
                            <p className="text-gray-500 mt-1">
                                期間: {project.term_start} 〜 {project.term_end} | 全体予算: {formatCurrency(project.total_budget)}
                            </p>
                        </div>
                        <button onClick={handleEditProjectClick} className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-lg border border-gray-200 shadow-sm" title="プロジェクトを編集">
                            <Edit2 className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* Left Column: Expense Input Form */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Expense Input Form */}
                    <ExpenseForm projectId={project.id} categories={assignedCategories} />
                </div>

                {/* Right Column: Budget Planning Matrix */}
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">


                        <BudgetMatrix
                            projectId={project.id}
                            termStart={project.term_start}
                            termEnd={project.term_end}
                            categories={assignedCategories}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectDetail;
