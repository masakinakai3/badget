/**
 * MIT License
 * Copyright (c) 2026 masakinakai3
 */
export const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return '0.0万円';
    return `${(amount / 10000).toLocaleString('ja-JP', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    })}万円`;
};
