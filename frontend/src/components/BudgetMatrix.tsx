/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
import React, { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import type { Category } from '../types';
import { formatCurrency } from '../utils/format';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';

interface BudgetMatrixProps {
    projectId: number;
    termStart: string; // e.g. "2024-04"
    termEnd: string;   // e.g. "2024-09"
    categories: Category[];
}

// 期間から月名の配列を生成するユーティリティ (簡易実装)
const generateMonths = (start: string, end: string) => {
    const months = [];
    let current = new Date(`${start}-01`);
    const endDate = new Date(`${end}-01`);

    while (current <= endDate) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        months.push(`${y}-${m}`);
        current.setMonth(current.getMonth() + 1);
    }
    return months;
};

const BudgetMatrix = ({ projectId, termStart, termEnd, categories }: BudgetMatrixProps) => {
    const { plans, expenses, savePlan, updateExpense, deleteExpense } = useBudget(projectId);
    const months = generateMonths(termStart, termEnd);

    // 編集状態の管理（予定額）
    const [editingPlan, setEditingPlan] = useState<{ catId: number, month: string } | null>(null);
    const [editValue, setEditValue] = useState('');

    // 編集状態の管理（実績額）
    const [editingExpense, setEditingExpense] = useState<number | null>(null);
    const [expenseEditAmount, setExpenseEditAmount] = useState('');
    const [expenseEditNote, setExpenseEditNote] = useState('');
    const [expenseEditDate, setExpenseEditDate] = useState('');

    // 展開状態の管理
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    const toggleExpand = (catId: number) => {
        setExpandedCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const handleToggleCompletion = async (exp: any, isCompleted: boolean) => {
        try {
            await updateExpense(exp.id, exp.category_id, exp.year_month, exp.date, exp.actual_amount, exp.note || '', isCompleted);
        } catch (err) {
            console.error('Failed to toggle completion', err);
        }
    };

    const getPlanAmount = (catId: number, month: string) => {
        const plan = plans.find(p => p.category_id === catId && p.year_month === month);
        return plan ? plan.planned_amount : 0;
    };

    const getExpenseTotal = (catId: number, month: string) => {
        return expenses
            .filter(e => e.category_id === catId && e.year_month === month && e.is_completed === 1)
            .reduce((sum, e) => sum + e.actual_amount, 0);
    };

    const getAllExpenseTotal = (catId: number, month: string) => {
        return expenses
            .filter(e => e.category_id === catId && e.year_month === month)
            .reduce((sum, e) => sum + e.actual_amount, 0);
    };

    const handlePlanClick = (catId: number, month: string, currentAmount: number) => {
        setEditingPlan({ catId, month });
        setEditValue((currentAmount / 10000).toString());
    };

    const handlePlanSave = async () => {
        if (!editingPlan) return;
        const amount = Number(editValue) * 10000;
        if (!isNaN(amount)) {
            await savePlan(editingPlan.catId, editingPlan.month, amount);
        }
        setEditingPlan(null);
    };

    const handleExpenseClick = (exp: any) => {
        setEditingExpense(exp.id);
        setExpenseEditAmount((exp.actual_amount / 10000).toString());
        setExpenseEditNote(exp.note || '');
        setExpenseEditDate(exp.date);
    };

    const handleExpenseSave = async (exp: any) => {
        if (!editingExpense) return;
        const amount = Number(expenseEditAmount) * 10000;
        const newYearMonth = expenseEditDate.substring(0, 7); // Calculate YYYY-MM from YYYY-MM-DD
        if (!isNaN(amount)) {
            await updateExpense(exp.id, exp.category_id, newYearMonth, expenseEditDate, amount, expenseEditNote, Boolean(exp.is_completed));
        }
        setEditingExpense(null);
    };

    const handleExpenseDelete = async (id: number) => {
        if (window.confirm('この支出記録を削除してもよろしいですか？')) {
            try {
                await deleteExpense(id);
                setEditingExpense(null);
            } catch (err) {
                console.error('Failed to delete expense', err);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, isExpense = false, expObj: any = null) => {
        if (e.key === 'Enter') {
            if (isExpense) handleExpenseSave(expObj);
            else handlePlanSave();
        }
        if (e.key === 'Escape') {
            if (isExpense) setEditingExpense(null);
            else setEditingPlan(null);
        }
    };

    const handleExportCSV = () => {
        // Headers
        const headers = ['項目', '種別', ...months, '合計', '備考'];
        const csvRows: string[][] = [headers];

        // Data rows
        categories.forEach(cat => {
            // 予定行
            let planTotal = 0;
            const planRow = [cat.name, '予定'];
            months.forEach(m => {
                const amount = getPlanAmount(cat.id, m);
                planTotal += amount;
                planRow.push((amount / 10000).toString());
            });

            // 実績行 (完了分のみの合計)
            let expTotal = 0;
            const expRow = [cat.name, '実績'];
            months.forEach(m => {
                const amount = getExpenseTotal(cat.id, m);
                expTotal += amount;
                expRow.push((amount / 10000).toString());
            });

            // 差額行
            let diffTotal = 0;
            const diffRow = [cat.name, '差額'];
            months.forEach(m => {
                const p = getPlanAmount(cat.id, m);
                const e = getExpenseTotal(cat.id, m);
                const diff = p - e;
                diffTotal += diff;
                diffRow.push((diff / 10000).toString());
            });

            // 予定行の追加
            planRow.push((planTotal / 10000).toString()); // 合計
            planRow.push(''); // No note for total
            csvRows.push(planRow);

            // 実績行の追加
            expRow.push((expTotal / 10000).toString()); // 合計
            expRow.push(''); // No note for total
            csvRows.push(expRow);

            // 差額行の追加
            diffRow.push((diffTotal / 10000).toString()); // 合計
            diffRow.push(''); // No note for total
            csvRows.push(diffRow);

            // 内訳行 (すべての実績を個別にリスト)
            const catExpenses = expenses.filter(e => e.category_id === cat.id);
            if (catExpenses.length > 0) {
                catExpenses.forEach(exp => {
                    const detailRow = [cat.name, `内訳 (${exp.date})`];
                    months.forEach(m => {
                        if (exp.year_month === m) {
                            detailRow.push((exp.actual_amount / 10000).toString());
                        } else {
                            detailRow.push('');
                        }
                    });
                    detailRow.push(''); // Total column intentionally blank for single item

                    const statusText = exp.is_completed ? '[完] ' : '[未] ';
                    const noteText = exp.note || '';
                    detailRow.push(`${statusText}${noteText}`);
                    csvRows.push(detailRow);
                });
            }

            // 空行で区切る
            csvRows.push([]);
        });



        const escapeCSV = (str: string | number) => {
            if (str === null || str === undefined) return '';
            const s = String(str);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        };

        const csvContent = "\uFEFF" + csvRows.map(row => row.map(escapeCSV).join(",")).join("\n"); // Add BOM for Excel
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `budget_matrix_${termStart}_${termEnd}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">予実管理マトリックス</h3>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center text-sm px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    CSVダウンロード
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-gray-700 uppercase font-medium">
                        <tr>
                            <th className="px-4 py-3 border-b min-w-[150px] sticky left-0 bg-gray-100 shadow-[1px_0_0_#e5e7eb]">項目</th>
                            <th className="px-4 py-3 border-b text-center w-24">種別</th>
                            {months.map(m => (
                                <th key={m} className="px-4 py-3 border-b text-right min-w-[120px]">{m}</th>
                            ))}
                            <th className="px-4 py-3 border-b text-right font-bold w-32">合計</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={months.length + 3} className="px-4 py-8 text-center text-gray-500">
                                    左側のパネルから項目（カテゴリ）を追加してください。
                                </td>
                            </tr>
                        ) : (
                            categories.map((cat, idx) => {
                                const rowClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                                // 行の合計計算
                                const catPlanTotal = months.reduce((sum, m) => sum + getPlanAmount(cat.id, m), 0);
                                const catExpTotal = months.reduce((sum, m) => sum + getExpenseTotal(cat.id, m), 0);
                                const difference = catPlanTotal - catExpTotal;
                                const isExpanded = expandedCategories.includes(cat.id);

                                return (
                                    <React.Fragment key={cat.id}>
                                        {/* 計画行 */}
                                        <tr className={`${rowClass} border-t`}>
                                            <td rowSpan={isExpanded ? 4 : 3} className={`px-4 py-3 border-r font-medium border-b sticky left-0 ${rowClass} shadow-[1px_0_0_#e5e7eb] align-top`}>
                                                <div className="flex items-center justify-between">
                                                    <span>{cat.name}</span>
                                                    <button
                                                        onClick={() => toggleExpand(cat.id)}
                                                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 border-r text-gray-500 bg-blue-50/30 text-center">予定</td>
                                            {months.map(m => {
                                                const amount = getPlanAmount(cat.id, m);
                                                const isEditing = editingPlan?.catId === cat.id && editingPlan?.month === m;

                                                return (
                                                    <td key={`plan-${m}`} className="px-4 py-2 border-r text-right bg-blue-50/30">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                autoFocus
                                                                min="0"
                                                                step="0.1"
                                                                value={editValue}
                                                                onChange={e => setEditValue(e.target.value)}
                                                                onBlur={handlePlanSave}
                                                                onKeyDown={handleKeyDown}
                                                                className="w-full text-right px-1 border-blue-500 border rounded"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors flex flex-col items-end"
                                                                onClick={() => handlePlanClick(cat.id, m, amount)}
                                                            >
                                                                <span>{formatCurrency(amount)}</span>
                                                                <span className="text-[10px] text-gray-500 font-normal">
                                                                    ({formatCurrency(getAllExpenseTotal(cat.id, m))})
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-2 text-right font-bold bg-blue-50/30">
                                                <div className="flex flex-col items-end">
                                                    <span>{formatCurrency(catPlanTotal)}</span>
                                                    <span className="text-[10px] text-gray-500 font-normal">
                                                        ({formatCurrency(months.reduce((sum, m) => sum + getAllExpenseTotal(cat.id, m), 0))})
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* 実績行 */}
                                        <tr className={`${rowClass} border-b`}>
                                            <td className="px-4 py-2 border-r text-gray-500 bg-red-50/30 text-center">実績</td>
                                            {months.map(m => {
                                                const amount = getExpenseTotal(cat.id, m);
                                                return (
                                                    <td key={`exp-${m}`} className="px-4 py-2 border-r text-right bg-red-50/30">
                                                        {formatCurrency(amount)}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-2 text-right font-bold bg-red-50/30">{formatCurrency(catExpTotal)}</td>
                                        </tr>

                                        {/* 差額行 */}
                                        <tr className={`${rowClass} ${isExpanded ? 'border-b-0' : 'border-b'}`}>
                                            <td className="px-4 py-2 border-r text-gray-700 bg-green-50/30 text-center">差額</td>
                                            {months.map(m => {
                                                const p = getPlanAmount(cat.id, m);
                                                const e = getExpenseTotal(cat.id, m);
                                                const diff = p - e;
                                                return (
                                                    <td key={`diff-${m}`} className={`px-4 py-2 border-r text-right bg-green-50/30 font-medium ${diff < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                                        {formatCurrency(diff)}
                                                    </td>
                                                );
                                            })}
                                            <td className={`px-4 py-2 text-right font-bold bg-green-50/30 ${difference < 0 ? 'text-red-500' : 'text-gray-900'}`}>{formatCurrency(difference)}</td>
                                        </tr>

                                        {/* 内訳行（展開時） */}
                                        {isExpanded && (
                                            <tr className={`${rowClass} border-b text-xs`}>
                                                <td className="px-4 py-2 border-r text-gray-400 bg-red-50/10 text-center align-top">内訳</td>
                                                {months.map(m => {
                                                    const monthlyExpenses = expenses.filter(e => e.category_id === cat.id && e.year_month === m);
                                                    return (
                                                        <td key={`detail-${m}`} className="px-2 py-2 border-r align-top bg-red-50/10">
                                                            {monthlyExpenses.length > 0 ? (
                                                                <div className="space-y-1">
                                                                    {monthlyExpenses.map(exp => (
                                                                        <div key={exp.id} className="border-b border-red-100 last:border-0 pb-1 last:pb-0">
                                                                            {editingExpense === exp.id ? (
                                                                                <div className="flex flex-col space-y-1 mb-1 bg-white p-1 rounded border border-blue-300">
                                                                                    <div className="flex items-center space-x-1">
                                                                                        <input
                                                                                            type="month"
                                                                                            value={expenseEditDate}
                                                                                            onChange={e => setExpenseEditDate(e.target.value)}
                                                                                            className="w-[110px] text-[10px] px-1 border border-gray-300 rounded"
                                                                                        />
                                                                                        <input
                                                                                            type="number"
                                                                                            autoFocus
                                                                                            min="0"
                                                                                            step="0.1"
                                                                                            value={expenseEditAmount}
                                                                                            onChange={e => setExpenseEditAmount(e.target.value)}
                                                                                            onKeyDown={(e) => handleKeyDown(e, true, exp)}
                                                                                            className="flex-1 w-0 text-right px-1 border-blue-500 border rounded text-xs"
                                                                                            placeholder="金額(万)"
                                                                                        />
                                                                                    </div>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={expenseEditNote}
                                                                                        onChange={e => setExpenseEditNote(e.target.value)}
                                                                                        onKeyDown={(e) => handleKeyDown(e, true, exp)}
                                                                                        className="w-full px-1 border-blue-500 border rounded text-[10px]"
                                                                                        placeholder="備考"
                                                                                    />
                                                                                    <div className="flex justify-between space-x-1 mt-1">
                                                                                        <button
                                                                                            onClick={() => handleExpenseDelete(exp.id)}
                                                                                            className="text-[10px] bg-red-100 hover:bg-red-200 text-red-600 px-2 rounded"
                                                                                        >
                                                                                            削除
                                                                                        </button>
                                                                                        <div className="flex space-x-1">
                                                                                            <button
                                                                                                onClick={() => setEditingExpense(null)}
                                                                                                className="text-[10px] bg-gray-200 hover:bg-gray-300 px-2 rounded"
                                                                                            >
                                                                                                ｷｬﾝｾﾙ
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleExpenseSave(exp)}
                                                                                                className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2 rounded"
                                                                                            >
                                                                                                保存
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <div className="flex justify-between items-center text-gray-500 mb-0.5">
                                                                                        <span>{exp.date}</span>
                                                                                        <div className="flex items-center space-x-1.5">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={exp.is_completed === 1}
                                                                                                onChange={(e) => handleToggleCompletion(exp, e.target.checked)}
                                                                                                className="h-3 w-3 text-blue-600 rounded border-gray-300 cursor-pointer"
                                                                                                title="完了（実績に反映）"
                                                                                            />
                                                                                            <span
                                                                                                className={`font-medium cursor-pointer hover:bg-red-100 rounded px-1 transition-colors ${exp.is_completed === 1 ? 'text-gray-700' : 'text-gray-400'}`}
                                                                                                onClick={() => handleExpenseClick(exp)}
                                                                                                title="金額または備考を編集"
                                                                                            >
                                                                                                {formatCurrency(exp.actual_amount)}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    {exp.note && <div className="text-gray-400 truncate text-[10px]" title={exp.note}>{exp.note}</div>}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : null}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-4 py-2 text-right bg-red-50/10 text-gray-400">-</td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default BudgetMatrix;
