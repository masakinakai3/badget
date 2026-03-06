/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import React, { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import type { Category } from '../types';
import { formatCurrency } from '../utils/format';

interface ExpenseFormProps {
    projectId: number;
    categories: Category[];
}

const ExpenseForm = ({ projectId, categories }: ExpenseFormProps) => {
    const { saveExpense, expenses, deleteExpense, updateExpense } = useBudget(projectId);

    const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<string>('');
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // default yearMonth to the YYYY-MM of the selected date
    const yearMonth = date ? date.substring(0, 7) : '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId || !date || !amount) return;

        setLoading(true);
        try {
            if (editingExpenseId) {
                await updateExpense(editingExpenseId, Number(categoryId), yearMonth, date, Number(amount) * 10000, note, isCompleted);
                setEditingExpenseId(null);
            } else {
                await saveExpense(Number(categoryId), yearMonth, date, Number(amount) * 10000, note, isCompleted);
            }
            // Reset form on success
            setAmount('');
            setNote('');
            setIsCompleted(false);
            // keep category and date as they might enter multiple for the same day/cat
        } catch (err) {
            console.error('Failed to save expense', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (exp: any) => {
        setEditingExpenseId(exp.id);
        setCategoryId(exp.category_id.toString());
        setDate(exp.date);
        setAmount((exp.actual_amount / 10000).toString());
        setNote(exp.note || '');
        setIsCompleted(Boolean(exp.is_completed));
    };

    const handleCancelEdit = () => {
        setEditingExpenseId(null);
        setAmount('');
        setNote('');
        setIsCompleted(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {editingExpenseId ? '支出実績の編集' : '支出実績の入力'}
                </h3>

                {categories.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">先に項目（カテゴリ）を登録してください。</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                                <select
                                    required
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="" disabled>選択してください...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">発生月</label>
                                <input
                                    type="month"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">金額 (万円)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.1"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="例: 1.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="購入先や詳細など"
                                />
                                <div className="mt-4 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="completed"
                                        checked={isCompleted}
                                        onChange={e => setIsCompleted(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
                                        完了（予算の実績に反映する）
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                            {editingExpenseId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    キャンセル
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? '保存中...' : (editingExpenseId ? '更新' : '実績を登録')}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* 最近の支出リスト */}
            <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-3">最近の登録一覧</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {expenses.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2">実績の登録はありません。</p>
                    ) : (
                        expenses.slice().reverse().map(exp => {
                            const catName = categories.find(c => c.id === exp.category_id)?.name || '不明なカテゴリ';
                            return (
                                <div key={exp.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-800">
                                            {catName} <span className="text-gray-400 font-normal ml-2">{exp.date}</span>
                                            {exp.is_completed === 1 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">完了</span>}
                                        </span>
                                        {exp.note && <span className="text-gray-500 text-xs mt-1">{exp.note}</span>}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="font-bold text-red-600">{formatCurrency(exp.actual_amount)}</span>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleEditClick(exp)}
                                                className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                                                title="編集"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => deleteExpense(exp.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="削除"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseForm;
