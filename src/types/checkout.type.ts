// src/types/checkout.types.ts

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export type PlanType = 'plan-monthly' | 'plan-annual';
export type CoinAmount = '300' | '900' | '1800' | '3600';

export interface CoinPackage {
  amount: CoinAmount;
  coins: number;
  price: number;
  bonus?: number;
  bonusLabel?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { 
    amount: '300', 
    coins: 300, 
    price: 9.90,
  },
  { 
    amount: '900', 
    coins: 900, 
    price: 24.90, 
    bonus: 50,
    bonusLabel: '+50 bônus',
    isPopular: true,
  },
  { 
    amount: '1800', 
    coins: 1800, 
    price: 44.90, 
    bonus: 150,
    bonusLabel: '+150 bônus',
  },
  { 
    amount: '3600', 
    coins: 3600, 
    price: 79.90, 
    bonus: 400,
    bonusLabel: '+400 bônus',
    isBestValue: true,
  },
];

// Utilitário para calcular preço por moeda
export const getPricePerCoin = (pkg: CoinPackage): number => {
  const totalCoins = pkg.coins + (pkg.bonus || 0);
  return pkg.price / totalCoins;
};

// Utilitário para calcular economia
export const getSavingsPercentage = (pkg: CoinPackage): number => {
  const basePackage = COIN_PACKAGES[0];
  const basePricePerCoin = basePackage.price / basePackage.coins;
  const currentPricePerCoin = getPricePerCoin(pkg);
  return Math.round((1 - currentPricePerCoin / basePricePerCoin) * 100);
};