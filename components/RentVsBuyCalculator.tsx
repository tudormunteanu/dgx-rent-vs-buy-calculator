import React, { useMemo, useState } from 'react';
import { ChevronDown, Info, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Section } from './Section';
import { track } from '../analytics';
import { useEmbedResize } from '../lib/use-embed-resize';
import {
  DEFAULT_HOURLY_RATE,
  DEFAULT_PURCHASE_PRICE,
  HOURS_PER_MONTH,
  USAGE_SCENARIOS,
  type RentPriceUnit,
  breakEvenHours,
  breakEvenMonths,
  formatHours,
  formatUsd,
  hourlyRateFromUnit,
  priceFromHourly,
  rentCost,
} from '../lib/rent-vs-buy';

const GITHUB_URL = 'https://github.com/tudormunteanu/dgx-rent-vs-buy-calculator';

function parsePositive(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

type Verdict = 'rent' | 'buy' | 'close';

function getVerdict(breakEvenMonthsValue: number | null, years: number): Verdict {
  if (breakEvenMonthsValue === null) return 'rent';
  const horizonMonths = years * 12;
  if (breakEvenMonthsValue > horizonMonths * 1.15) return 'rent';
  if (breakEvenMonthsValue < horizonMonths * 0.85) return 'buy';
  return 'close';
}

export const RentVsBuyCalculator: React.FC = () => {
  useEmbedResize(true);

  const [rentUnit, setRentUnit] = useState<RentPriceUnit>('hour');
  const [rentPrice, setRentPrice] = useState(String(DEFAULT_HOURLY_RATE));
  const [purchasePrice, setPurchasePrice] = useState(String(DEFAULT_PURCHASE_PRICE));
  const [hoursPerMonth, setHoursPerMonth] = useState('160');
  const [ownershipYears, setOwnershipYears] = useState('3');
  const [monthlyOwnershipCost, setMonthlyOwnershipCost] = useState('25');

  const hourlyRate = useMemo(
    () => hourlyRateFromUnit(parsePositive(rentPrice, DEFAULT_HOURLY_RATE), rentUnit),
    [rentPrice, rentUnit],
  );
  const purchase = parsePositive(purchasePrice, DEFAULT_PURCHASE_PRICE);
  const usageHoursMonth = parsePositive(hoursPerMonth, 160);
  const years = Math.max(1, parsePositive(ownershipYears, 3));
  const monthlyExtra = parsePositive(monthlyOwnershipCost, 0);

  const breakEvenHrs = breakEvenHours(purchase, hourlyRate);
  const breakEvenMo = breakEvenMonths(purchase, hourlyRate, usageHoursMonth);
  const monthlyRent = rentCost(usageHoursMonth, hourlyRate);
  const yearlyRent = monthlyRent * 12;
  const totalRent = yearlyRent * years;
  const totalBuy = purchase + monthlyExtra * 12 * years;
  const savings = totalBuy - totalRent;
  const verdict = getVerdict(breakEvenMo, years);

  const handleUnitChange = (unit: RentPriceUnit) => {
    const currentHourly = hourlyRateFromUnit(parsePositive(rentPrice, DEFAULT_HOURLY_RATE), rentUnit);
    setRentUnit(unit);
    setRentPrice(priceFromHourly(currentHourly, unit).toFixed(unit === 'minute' ? 4 : 2));
    track('rent_vs_buy_unit_changed', { unit });
  };

  const presetPurchase = (value: number) => {
    setPurchasePrice(String(value));
    track('rent_vs_buy_purchase_preset', { value });
  };

  return (
    <div className="min-h-0 overflow-x-hidden">
      <main id="main-content" className="px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-dark leading-tight">
              DGX Spark Rent vs Buy Calculator
            </h1>
          </header>

          <div className="panel p-6 md:p-8 mb-10">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="rent-price" className="block text-sm font-medium text-neutral-700 mb-2">
                    Rental price
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                      <input
                        id="rent-price"
                        type="number"
                        min={0}
                        step={rentUnit === 'minute' ? 0.0001 : 0.01}
                        value={rentPrice}
                        onChange={(e) => setRentPrice(e.target.value)}
                        className="input-field pl-8"
                      />
                    </div>
                    <div className="relative w-36">
                      <select
                        id="rent-unit"
                        value={rentUnit}
                        onChange={(e) => handleUnitChange(e.target.value as RentPriceUnit)}
                        className="select-field"
                        aria-label="Rental price unit"
                      >
                        <option value="minute">/ minute</option>
                        <option value="hour">/ hour</option>
                        <option value="month">/ month</option>
                        <option value="year">/ year</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Effective rate: {formatUsd(hourlyRate, 2)}/hour
                    {rentUnit === 'month' && ` (at ${HOURS_PER_MONTH} h/mo full-time equivalent)`}
                  </p>
                </div>

                <div>
                  <label htmlFor="purchase-price" className="block text-sm font-medium text-neutral-700 mb-2">
                    Purchase price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                    <input
                      id="purchase-price"
                      type="number"
                      min={0}
                      step={100}
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="input-field pl-8"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      { label: 'GB10 clone (~$3k)', value: 2999 },
                      { label: 'DGX Spark MSRP ($4,699)', value: 4699 },
                      { label: 'Launch price ($3,999)', value: 3999 },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => presetPurchase(preset.value)}
                        className="text-xs px-3 py-1 rounded-full border border-neutral-300 text-neutral-600 hover:text-dark hover:border-neutral-500 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="hours-month" className="block text-sm font-medium text-neutral-700 mb-2">
                    GPU hours per month
                  </label>
                  <input
                    id="hours-month"
                    type="range"
                    min={1}
                    max={730}
                    value={Math.min(730, Math.max(1, usageHoursMonth))}
                    onChange={(e) => setHoursPerMonth(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-2 gap-4">
                    <input
                      type="number"
                      min={1}
                      max={730}
                      value={hoursPerMonth}
                      onChange={(e) => setHoursPerMonth(e.target.value)}
                      className="input-field max-w-[120px]"
                      aria-label="GPU hours per month numeric input"
                    />
                    <span className="text-xs text-neutral-500">
                      {((usageHoursMonth / HOURS_PER_MONTH) * 100).toFixed(0)}% of always-on
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ownership-years" className="block text-sm font-medium text-neutral-700 mb-2">
                      Compare over
                    </label>
                    <div className="relative">
                      <select
                        id="ownership-years"
                        value={ownershipYears}
                        onChange={(e) => setOwnershipYears(e.target.value)}
                        className="select-field"
                      >
                        <option value="1">1 year</option>
                        <option value="2">2 years</option>
                        <option value="3">3 years</option>
                        <option value="5">5 years</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="monthly-extra" className="block text-sm font-medium text-neutral-700 mb-2">
                      Ownership extras / mo
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                      <input
                        id="monthly-extra"
                        type="number"
                        min={0}
                        step={5}
                        value={monthlyOwnershipCost}
                        onChange={(e) => setMonthlyOwnershipCost(e.target.value)}
                        className="input-field pl-8"
                        title="Electricity, internet, maintenance"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="panel p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {verdict === 'rent' ? (
                      <TrendingDown className="w-5 h-5 text-neutral-600" />
                    ) : verdict === 'buy' ? (
                      <TrendingUp className="w-5 h-5 text-neutral-600" />
                    ) : (
                      <Minus className="w-5 h-5 text-neutral-600" />
                    )}
                    <h2 className="text-lg font-semibold text-dark">
                      {verdict === 'rent' && 'Renting is cheaper'}
                      {verdict === 'buy' && 'Buying breaks even'}
                      {verdict === 'close' && 'Close call — usage matters'}
                    </h2>
                  </div>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                    Over {years} {years === 1 ? 'year' : 'years'} at {usageHoursMonth} h/mo,{' '}
                    {verdict === 'rent'
                      ? `renting saves about ${formatUsd(Math.abs(savings))} vs buying (including ${formatUsd(monthlyExtra)}/mo ownership costs).`
                      : verdict === 'buy'
                        ? `buying saves about ${formatUsd(Math.abs(savings))} vs renting at ${formatUsd(hourlyRate, 2)}/hr.`
                        : `total costs are within ~15% — small usage changes flip the outcome.`}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Rent ({years} yr)</p>
                      <p className="text-2xl font-bold text-dark tabular-nums">{formatUsd(totalRent)}</p>
                      <p className="text-xs text-neutral-500 mt-1">{formatUsd(monthlyRent)}/mo</p>
                    </div>
                    <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Buy ({years} yr)</p>
                      <p className="text-2xl font-bold text-dark tabular-nums">{formatUsd(totalBuy)}</p>
                      <p className="text-xs text-neutral-500 mt-1">{formatUsd(purchase)} hardware + extras</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="panel p-4">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Break-even</p>
                    <p className="text-xl font-bold text-dark tabular-nums">
                      {breakEvenHrs !== null ? formatHours(breakEvenHrs) : '—'}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {breakEvenMo !== null
                        ? `${breakEvenMo.toFixed(1)} months at your usage`
                        : 'Enter valid prices'}
                    </p>
                  </div>
                  <div className="panel p-4">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Hourly rent</p>
                    <p className="text-xl font-bold text-dark tabular-nums">{formatUsd(hourlyRate, 2)}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatUsd(priceFromHourly(hourlyRate, 'month'), 0)}/mo at 730 h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Section
            title="Usage scenario comparison"
            subtitle="Estimated monthly and yearly rental cost at your configured rate. Break-even months assume zero ownership extras."
          >
            <div className="overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-300 text-neutral-600 text-xs uppercase tracking-widest">
                    <th className="py-4 px-4 font-medium">Usage</th>
                    <th className="py-4 px-4 font-medium text-right">Rent / month</th>
                    <th className="py-4 px-4 font-medium text-right hidden sm:table-cell">Rent / year</th>
                    <th className="py-4 px-4 font-medium text-right">Break-even</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-700">
                  {USAGE_SCENARIOS.map((scenario) => {
                    const mo = rentCost(scenario.hoursPerMonth, hourlyRate);
                    const yr = mo * 12;
                    const be = breakEvenMonths(purchase, hourlyRate, scenario.hoursPerMonth);
                    const isUserRow = Math.abs(scenario.hoursPerMonth - usageHoursMonth) < 20;
                    return (
                      <tr
                        key={scenario.hoursPerMonth}
                        className={`border-b border-neutral-300/60 last:border-0 ${
                          isUserRow ? 'bg-neutral-200' : 'hover:bg-neutral-200/60'
                        } transition-colors`}
                      >
                        <td className="py-4 px-4">
                          <span className={isUserRow ? 'text-dark font-medium' : ''}>{scenario.label}</span>
                          <span className="block text-xs text-neutral-500">{scenario.hoursPerMonth} h/mo</span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono tabular-nums">{formatUsd(mo)}</td>
                        <td className="py-4 px-4 text-right font-mono tabular-nums hidden sm:table-cell">
                          {formatUsd(yr)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono tabular-nums text-neutral-600">
                          {be !== null ? `${be.toFixed(1)} mo` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-start gap-3 text-xs text-neutral-600">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-neutral-500" />
              <p>
                Monthly rental assumes pay-per-hour billing for actual GPU runtime.
                &ldquo;Always on&rdquo; uses {HOURS_PER_MONTH} hours — the standard cloud pricing month.
              </p>
            </div>
          </Section>

          <p className="text-center text-xs text-neutral-500 mt-8">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-dark transition-colors"
            >
              Fork on GitHub
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};
