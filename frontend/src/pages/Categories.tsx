/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Plus, Trash2 } from 'lucide-react';

const Categories = () => {
    const { categories, loading, error, createCategory, deleteCategory } = useCategories();
    const [newCatName, setNewCatName] = useState('');

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        try {
            await createCategory(newCatName.trim());
            setNewCatName('');
        } catch (err: any) {
            alert(err.message || '追加に失敗しました');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('このカテゴリを削除しますか？\n（注：関連する予定・実績データがすべて消去される可能性があります）')) return;
        try {
            await deleteCategory(id);
        } catch (err: any) {
            alert(err.message || '削除に失敗しました');
        }
    };

    if (loading && categories.length === 0) return <div className="p-8 text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800">カテゴリ管理</h1>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center mb-6">
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">予算消化項目の設定</h2>
                <p className="text-gray-600 mb-8 max-w-2xl">
                    ここで登録したカテゴリは、すべてのプロジェクトの予実マトリックスおよび実績入力で共通して使用されます。プロジェクトごとに同じ項目を繰り返し登録する手間が省けます。
                </p>

                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 mb-10">
                    <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="新しい項目名 (例: 機材費, その他)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
                    />
                    <button
                        type="submit"
                        disabled={!newCatName.trim() || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        追加
                    </button>
                </form>

                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {categories.map((cat) => (
                            <li key={cat.id} className="flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                                <span className="font-medium text-gray-800 text-lg">{cat.name}</span>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                                    title="カテゴリを削除"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                        {categories.length === 0 && (
                            <li className="text-gray-500 text-center py-10 flex flex-col items-center">
                                <div className="bg-gray-100 p-4 rounded-full mb-3">
                                    <Plus className="w-8 h-8 text-gray-400" />
                                </div>
                                <p>カテゴリが1つも登録されていません。<br />上の入力フォームから追加してください。</p>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Categories;
