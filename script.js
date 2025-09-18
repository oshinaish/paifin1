/**
* PaiFinance - Interactive Script
* Version: 19.1 - FINAL STABLE
* Last updated: September 9, 2025, 11:36 PM IST
* Built by the Bros.
*/

document.addEventListener('DOMContentLoaded', () => {

// --- 1. ELEMENT SELECTION ---
const loanAmountInput = document.getElementById('loanAmount');
const loanAmountSlider = document.getElementById('loanAmountSlider');
const monthlyBudgetInput = document.getElementById('monthlyBudget');
const monthlyBudgetSlider = document.getElementById('monthlyBudgetSlider');
const loanInterestRateInput = document.getElementById('loanInterestRateDisplay');
const loanInterestRateSlider = document.getElementById('loanInterestRateSlider');
const investmentRateInput = document.getElementById('investmentRateDisplay');
const investmentRateSlider = document.getElementById('investmentRateSlider');
const loanTenureContainer = document.getElementById('loanTenureContainer');
const loanTenureInput = document.getElementById('loanTenureDisplay');
const loanTenureSlider = document.getElementById('loanTenureSlider');
const investmentTenureContainer = document.getElementById('investmentTenureContainer');
const investmentTenureInput = document.getElementById('investmentTenureDisplay');
const investmentTenureSlider = document.getElementById('investmentTenureSlider');
const investmentTenureLabel = document.getElementById('investmentTenureLabel');
const emiResultElement = document.getElementById('emiResult');
const monthlyInvestmentResult = document.getElementById('monthlyInvestmentResult');
const monthlyInvestmentSubtext = document.getElementById('monthlyInvestmentSubtext');

// Global state
let planningHorizon = 30; // Default value, will be updated from onboarding

// Result Containers
const finalResultsSection = document.getElementById('finalResultsSection');
const mainResultsContainer = document.getElementById('mainResultsContainer');
const comparisonChartContainer = document.getElementById('comparisonChartContainer');
const chartExplanation = document.getElementById('chartExplanation');
const amortizationContainer = document.getElementById('amortizationContainer');
const amortizationExplanation = document.getElementById('amortizationExplanation');
const amortizationTableContainer = document.getElementById('amortizationTableContainer');
const paiVsTraditionalContainer = document.getElementById('paiVsTraditionalContainer');
const paiVsTraditionalExplanation = document.getElementById('paiVsTraditionalExplanation');
const summaryResultsContainer = document.getElementById('summaryResultsContainer');

const chartsContainer = document.getElementById('chartsContainer');
const goalButtons = document.querySelectorAll('.goal-button');
const chartCanvas = document.getElementById('monthlyBudgetChart');
const chartMessage = document.getElementById('chartMessage');
const comparisonChartCanvas = document.getElementById('comparisonChart');
const paiVsTraditionalChartCanvas = document.getElementById('paiVsTraditionalChart');
let monthlyBudgetChart = null;
let comparisonChart = null;
let loanWidgetChart = null;
let investmentWidgetChart = null;
let paiVsTraditionalChart = null;
let calculationTimeout;

// --- 2. CORE FINANCIAL ENGINE ---
function calculateEMI(principal, annualRate, tenureYears) {
if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return 0;
const monthlyRate = (annualRate / 100) / 12;
const tenureMonths = tenureYears * 12;
if (monthlyRate === 0) { return principal / tenureMonths; }
const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
return Math.round(emi);
}

function calculateFutureValue(monthlyInvestment, annualRate, tenureYears) {
if (monthlyInvestment <= 0 || annualRate < 0 || tenureYears <= 0) return 0;
const monthlyRate = (annualRate / 100) / 12;
const tenureMonths = tenureYears * 12;
if (monthlyRate === 0) { return monthlyInvestment * tenureMonths; }
const fv = monthlyInvestment * ( (Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate );
return Math.round(fv);
}

function calculateTenureMonths(principal, annualRate, emi) {
if (principal <= 0 || annualRate <= 0 || emi <= 0) return 0;
const monthlyRate = (annualRate / 100) / 12;
if (emi <= principal * monthlyRate) return Infinity;
const numerator = Math.log(emi / (emi - (principal * monthlyRate)));
const denominator = Math.log(1 + monthlyRate);
return numerator / denominator;
}

// --- 3. GOAL-BASED CALCULATION STRATEGIES ---

function showWarningToast(message) {
const warningToast = document.getElementById('warningToast');
const warningMessage = document.getElementById('warningMessage');
let toastTimeout;

clearTimeout(toastTimeout);
warningMessage.textContent = message;
warningToast.classList.remove('hidden', 'opacity-0');
warningToast.classList.add('opacity-100');

toastTimeout = setTimeout(() => {
warningToast.classList.remove('opacity-100');
warningToast.classList.add('opacity-0');
setTimeout(() => {
warningToast.classList.add('hidden');
}, 300);
}, 3000);
}

function runPlannerMode() {
finalResultsSection.classList.remove('hidden');
comparisonChartContainer.classList.remove('hidden');
amortizationContainer.classList.remove('hidden');
paiVsTraditionalContainer.classList.add('hidden');
updatePlannerResults();
}

function findMinTimeToRepay() {
finalResultsSection.classList.remove('hidden');
comparisonChartContainer.classList.remove('hidden');
amortizationContainer.classList.remove('hidden');
mainResultsContainer.innerHTML = `<div class="text-center p-4">Calculating...</div>`;

clearTimeout(calculationTimeout);
calculationTimeout = setTimeout(() => {
const principal = parseFloat(loanAmountInput.value);
const budget = parseFloat(monthlyBudgetInput.value);
const loanAnnualRate = parseFloat(loanInterestRateInput.value);
const investmentAnnualRate = parseFloat(investmentRateInput.value);
const totalPlanningHorizon = planningHorizon;

if (budget <= (principal * (loanAnnualRate / 100 / 12))) {
showWarningToast("Budget is too low to cover even the first month's interest.");
mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Budget is insufficient to pay off the loan.</div>`;
return;
}

const tenureMonths = calculateTenureMonths(principal, loanAnnualRate, budget);
const loanTenureYears = tenureMonths / 12;

if (loanTenureYears > totalPlanningHorizon) {
showWarningToast("Loan cannot be paid off within your planning horizon.");
mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Payoff time (${formatYearsAndMonths(loanTenureYears)}) exceeds your planning horizon.</div>`;
loanTenureInput.value = formatYearsAndMonths(loanTenureYears);
investmentTenureInput.value = "0 Years";
return;
}

const remainingHorizon = totalPlanningHorizon - loanTenureYears;
const futureValue = calculateFutureValue(budget, investmentAnnualRate, remainingHorizon);
const totalInterestPaid = (budget * tenureMonths) - principal;
const netWealth = futureValue - totalInterestPaid;

loanTenureInput.value = formatYearsAndMonths(loanTenureYears);
investmentTenureInput.value = formatYearsAndMonths(remainingHorizon);
loanTenureSlider.value = loanTenureYears;
investmentTenureSlider.value = remainingHorizon;
updateSliderProgress(loanTenureSlider);
updateSliderProgress(investmentTenureSlider);

const scenario = {
tenure: loanTenureYears,
investmentTenure: remainingHorizon,
emi: budget,
monthlyInvestment: 0,
postLoanMonthlyInvestment: budget,
totalInterestPaid,
futureValue,
netWealth,
principal,
loanAnnualRate,
investmentAnnualRate
};
displayResults(scenario);
}, 500);
}


function findOptimalStrategy() {
finalResultsSection.classList.remove('hidden');
comparisonChartContainer.classList.remove('hidden');
amortizationContainer.classList.remove('hidden');
paiVsTraditionalContainer.classList.remove('hidden');
mainResultsContainer.innerHTML = `<div class="text-center p-4">Calculating...</div>`;

clearTimeout(calculationTimeout);
calculationTimeout = setTimeout(() => {
const principal = parseFloat(loanAmountInput.value);
const budget = parseFloat(monthlyBudgetInput.value);
const loanAnnualRate = parseFloat(loanInterestRateInput.value);
const investmentAnnualRate = parseFloat(investmentRateInput.value);
let bestScenario = null, maxNetWealth = -Infinity;

for (let tenure = 1; tenure <= 30; tenure++) {
const emi = calculateEMI(principal, loanAnnualRate, tenure);
if (emi > budget) continue;
const monthlyInvestment = budget - emi;
const totalInterestPaid = (emi * tenure * 12) - principal;
const futureValue = calculateFutureValue(monthlyInvestment, investmentAnnualRate, tenure);
const netWealth = futureValue - totalInterestPaid;
if (netWealth > maxNetWealth) {
maxNetWealth = netWealth;
bestScenario = { tenure, emi, monthlyInvestment, totalInterestPaid, futureValue, netWealth, principal, loanAnnualRate, investmentAnnualRate };
}
}

if (bestScenario) {
loanTenureInput.value = formatYearsAndMonths(bestScenario.tenure);
investmentTenureInput.value = formatYearsAndMonths(bestScenario.tenure);
loanTenureSlider.value = bestScenario.tenure;
investmentTenureSlider.value = bestScenario.tenure;
updateSliderProgress(loanTenureSlider);
updateSliderProgress(investmentTenureSlider);
displayResults(bestScenario);
} else {
mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found. Your budget may be too low for this loan amount and interest rate.</div>`;
}
}, 500);
}

function findMinimumTime() {
finalResultsSection.classList.remove('hidden');
comparisonChartContainer.classList.remove('hidden');
amortizationContainer.classList.remove('hidden');
paiVsTraditionalContainer.classList.remove('hidden');
mainResultsContainer.innerHTML = `<div class="text-center p-4">Calculating...</div>`;

clearTimeout(calculationTimeout);
calculationTimeout = setTimeout(() => {
const principal = parseFloat(loanAmountInput.value);
const budget = parseFloat(monthlyBudgetInput.value);
const loanAnnualRate = parseFloat(loanInterestRateInput.value);
const investmentAnnualRate = parseFloat(investmentRateInput.value);
let foundScenario = null;

for (let months = 1; months <= 360; months++) {
const tenureInYears = months / 12;
const emi = calculateEMI(principal, loanAnnualRate, tenureInYears);
if (emi > budget) continue;
const monthlyInvestment = budget - emi;
const totalInterestPaid = (emi * months) - principal;
const futureValue = calculateFutureValue(monthlyInvestment, investmentAnnualRate, tenureInYears);
if (futureValue >= totalInterestPaid) {
const netWealth = futureValue - totalInterestPaid;
foundScenario = { tenure: tenureInYears, emi, monthlyInvestment, totalInterestPaid, futureValue, netWealth, principal, loanAnnualRate, investmentAnnualRate };
break; 
}
}

if (foundScenario) {
loanTenureInput.value = formatYearsAndMonths(foundScenario.tenure);
investmentTenureInput.value = formatYearsAndMonths(foundScenario.tenure);
loanTenureSlider.value = foundScenario.tenure;
investmentTenureSlider.value = foundScenario.tenure;
updateSliderProgress(loanTenureSlider);
updateSliderProgress(investmentTenureSlider);
displayResults(foundScenario, formatYearsAndMonths(foundScenario.tenure));
} else {
mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Cannot offset interest within 30 years. Try increasing your budget or the investment return rate.</div>`;
}
}, 500);
}

// --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---
function renderResultWidgets(scenario, displayTenure) {
// --- 1. Determine Conditional Values Based on the Selected Goal ---
const selectedGoal = document.querySelector('.goal-button.selected').dataset.goal;
let investmentHorizonDisplay;

     if (selectedGoal === 'min-time-repay') {
            investmentHorizonDisplay = formatYearsAndMonths(scenario.investmentTenure);
        } else if (selectedGoal === 'planner'){
             investmentHorizonDisplay = formatYearsAndMonths(scenario.investmentTenure);
        }
        else {
            investmentHorizonDisplay = formatYearsAndMonths(scenario.tenure);
        }


// --- 2. Define data for each of the four widgets ---
const totalPaid = scenario.principal + scenario.totalInterestPaid;
let totalInvested;
     if(scenario.postLoanMonthlyInvestment) {
             totalInvested = scenario.postLoanMonthlyInvestment * scenario.investmentTenure * 12;
        } else if (selectedGoal === 'optimal-strategy') {
            const emiForInvestment = scenario.emi || 0;
            const invForInvestment = scenario.monthlyInvestment || 0;
            totalInvested = (invForInvestment * planningHorizon * 12) + (emiForInvestment * (planningHorizon - scenario.tenure) * 12);
        } else {
             const investmentDuration = scenario.investmentTenure || scenario.tenure;
             totalInvested = (scenario.monthlyInvestment || 0) * Math.round(investmentDuration * 12);
        }

const totalGains = scenario.futureValue - totalInvested;
const netWealth = scenario.futureValue - scenario.totalInterestPaid;

// --- 3. Build the HTML for all four widgets ---
mainResultsContainer.innerHTML = `
     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div class="bg-card p-4 rounded-lg shadow-default">
             <h3 class="text-sm font-bold text-textdark mb-2 text-center">Loan Details</h3>
             <div class="flex items-center gap-4">
                 <div class="w-20 h-20 relative flex-shrink-0">
                     <canvas id="loanWidgetChart"></canvas>
                     <div class="absolute inset-0 flex items-center justify-center text-base font-bold text-textdark">
                         <span>${Math.round((scenario.totalInterestPaid / totalPaid) * 100)}%</span>
                     </div>
                 </div>
                 <div class="text-textlight leading-relaxed w-full">
                     <table class="w-full text-xs">
                         <tbody>
                             <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Principal</td><td class="text-right font-normal text-textdark">₹${scenario.principal.toLocaleString('en-IN')}</td></tr>
                             <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-emi_purple mr-2"></span>Interest</td><td class="text-right font-normal text-emi_purple">₹${scenario.totalInterestPaid.toLocaleString('en-IN')}</td></tr>
                             <tr class="border-t"><td class="text-left font-semibold py-1">Total Paid</td><td class="text-right font-semibold text-textdark">₹${(scenario.principal + scenario.totalInterestPaid).toLocaleString('en-IN')}</td></tr>
                             <tr class="border-t"><td class="text-left font-normal py-1">Paid Off In</td><td class="text-right font-normal text-textdark">${displayTenure}</td></tr>
                         </tbody>
                     </table>
                 </div>
             </div>
         </div>

         <div class="bg-card p-4 rounded-lg shadow-default">
             <h3 class="text-sm font-bold text-textdark mb-2 text-center">Investment Details</h3>
             <div class="flex items-center gap-4">
                 <div class="w-20 h-20 relative flex-shrink-0">
                     <canvas id="investmentWidgetChart"></canvas>
                     <div class="absolute inset-0 flex items-center justify-center text-base font-bold text-textdark">
                         <span>${scenario.futureValue > 0 ? Math.round((totalGains / scenario.futureValue) * 100) : 0}%</span>
                     </div>
                 </div>
                 <div class="text-textlight leading-relaxed w-full">
                     <table class="w-full text-xs">
                         <tbody>
                             <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Invested</td><td class="text-right font-normal text-textdark">₹${totalInvested.toLocaleString('en-IN')}</td></tr>
                             <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-investment_green mr-2"></span>Gains</td><td class="text-right font-normal text-investment_green">₹${totalGains.toLocaleString('en-IN')}</td></tr>
                             <tr class="border-t"><td class="text-left font-semibold py-1">Total Wealth</td><td class="text-right font-semibold text-textdark">₹${scenario.futureValue.toLocaleString('en-IN')}</td></tr>
                             <tr class="border-t"><td class="text-left font-normal py-1">Horizon</td><td class="text-right font-normal text-textdark">${investmentHorizonDisplay}</td></tr>
                         </tbody>
                     </table>
                 </div>
             </div>
         </div>

         <div class="bg-card p-4 rounded-lg shadow-default">
             <h3 class="text-sm font-bold text-textdark mb-2 text-center">Net Money Input</h3>
             <div class="text-textlight leading-relaxed text-xs">
                 <table class="w-full text-xs">
                     <tbody>
                         <tr><td class="text-left py-1">Total EMIs</td><td class="text-right font-normal">₹${totalPaid.toLocaleString('en-IN')}</td></tr>
                         <tr><td class="text-left py-1">Total Investments</td><td class="text-right font-normal">₹${totalInvested.toLocaleString('en-IN')}</td></tr>
                         <tr class="bg-gray-100 rounded"><td class="text-left font-semibold p-1">Total Outflow</td><td class="text-right font-bold p-1">₹${(totalPaid + totalInvested).toLocaleString('en-IN')}</td></tr>
                     </tbody>
                 </table>
             </div>
         </div>

         <div class="bg-card p-4 rounded-lg shadow-default">
             <h3 class="text-sm font-bold text-textdark mb-2 text-center">Net Wealth</h3>
             <div class="text-textlight leading-relaxed text-xs">
                 <table class="w-full text-xs">
                     <tbody>
                         <tr><td class="text-left py-1">Total Wealth</td><td class="text-right font-normal">₹${scenario.futureValue.toLocaleString('en-IN')}</td></tr>
                         <tr><td class="text-left py-1">Total Interest Paid</td><td class="text-right font-normal text-danger">- ₹${scenario.totalInterestPaid.toLocaleString('en-IN')}</td></tr>
                         <tr class="bg-green-50 rounded"><td class="text-left font-semibold p-1">Net Wealth</td><td class="text-right font-bold p-1 text-investment_green">₹${netWealth.toLocaleString('en-IN')}</td></tr>
                     </tbody>
                 </table>
             </div>
         </div>
     </div>
 `;

// --- 4. Render the Mini Doughnut Charts ---
renderWidgetCharts(scenario, totalInvested, totalGains);
}

function updatePlannerResults() {
const principal = parseFloat(loanAmountInput.value);
const annualRate = parseFloat(loanInterestRateInput.value);
const tenureYears = parseFloat(loanTenureSlider.value);
const budget = parseFloat(monthlyBudgetInput.value);
const investmentRate = parseFloat(investmentRateInput.value);
const investmentTenureYears = parseFloat(investmentTenureSlider.value);

loanTenureInput.value = `${tenureYears} Yr`;
investmentTenureInput.value = `${investmentTenureYears} Yr`;

const emi = calculateEMI(principal, annualRate, tenureYears);

monthlyBudgetInput.parentElement.classList.remove('animated-border');
emiResultElement.parentElement.classList.remove('animated-border');

if (budget < emi && emi > 0) {
showWarningToast('Monthly EMI cannot exceed your budget.');
monthlyBudgetInput.parentElement.classList.add('animated-border');
emiResultElement.parentElement.classList.add('animated-border');
emiResultElement.textContent = `₹ ${emi.toLocaleString('en-IN')}`;
monthlyInvestmentResult.textContent = '₹ 0';
updatePieChart(emi, 0);
finalResultsSection.classList.add('hidden');
summaryResultsContainer.classList.add('hidden');
return;
}

const investment = (budget >= emi) ? budget - emi : 0;
const totalInterestPaid = (emi * tenureYears * 12) - principal;
const futureValue = calculateFutureValue(investment, investmentRate, investmentTenureYears);
const netWealth = futureValue - totalInterestPaid;
const scenario = { tenure: tenureYears, investmentTenure: investmentTenureYears, emi, monthlyInvestment: investment, totalInterestPaid, futureValue, netWealth, principal, loanAnnualRate: annualRate, investmentAnnualRate: investmentRate };

finalResultsSection.classList.remove('hidden');
displayResults(scenario);
}

function formatYearsAndMonths(decimalYears) {
if (!decimalYears || decimalYears < 0) return "0 M";
const years = Math.floor(decimalYears);
const months = Math.round((decimalYears - years) * 12);
if (years > 0 && months > 0) return `${years} Yr, ${months} Mon`;
if (years > 0) return `${years} Yr`;
if (years > 0 && months > 0) return `${years} Yr, ${months} Mon`;
if (years > 0) return `${years} Yr`;
if (months > 0) return `${months} M`;
return "0 M";
}

function displayResults(scenario, tenureString = null) {
// --- 1. GET STATE & COMMON VALUES ---
const selectedGoal = document.querySelector('.goal-button.selected').dataset.goal;
const displayTenure = tenureString || formatYearsAndMonths(scenario.tenure);

// --- 2. RENDER COMMON UI & CHARTS (for all goals) ---
emiResultElement.textContent = `₹ ${scenario.emi.toLocaleString('en-IN')}`;
if (selectedGoal === 'min-time-repay') {
monthlyInvestmentResult.textContent = `₹ ${scenario.postLoanMonthlyInvestment.toLocaleString('en-IN')}`;
monthlyInvestmentSubtext.textContent = '(after loan)';
monthlyInvestmentSubtext.classList.remove('hidden');
} else {
const investmentAmount = scenario.monthlyInvestment || 0;
monthlyInvestmentResult.textContent = `₹ ${investmentAmount.toLocaleString('en-IN')}`;
monthlyInvestmentSubtext.classList.add('hidden');
}
updatePieChart(scenario.emi, scenario.monthlyInvestment || 0);

renderResultWidgets(scenario, displayTenure);
const chartData = generateComparisonData(scenario, selectedGoal);
renderComparisonChart(chartData);
const amortizationData = generateAmortizationSchedule(scenario);
renderAmortizationTable(amortizationData);

// --- 3. PREPARE GOAL-SPECIFIC CONTENT ---
let displayTitle = '';
let summaryHTML = '';
const crossoverYearText = chartData.crossoverYear ? `The key moment is in <strong>Year ${chartData.crossoverYear}</strong>, where your investment value surpasses your outstanding loan balance.` : '';

// ✅ 1. Declare a variable to hold the final HTML for the explanation.
let explanationHTML = '';

switch (selectedGoal) {
case 'planner':
displayTitle = 'Your Strategy Visualised';
paiVsTraditionalContainer.classList.add('hidden');
summaryHTML = `
               <h4 class="text-sm font-bold text-center mb-2">Result Summary</h4>
               <p class="text-xs text-center">Net Wealth after ${displayTenure}: <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong></p>
           `; 
break;

case 'min-time':
            displayTitle = 'The Race to Zero Debt';
            displayTitle = 'The Race to Zero Effective Rate of Interest';
paiVsTraditionalContainer.classList.remove('hidden');
summaryHTML = `
               <h4 class="text-sm font-bold text-center mb-2">Result Summary</h4>
               <p class="text-xs text-center">You can offset your loan interest in just <strong class="text-investment_green">${displayTenure}</strong>.</p>
               <p class="text-xs text-center mt-1">You can become debt-free in <strong>Year ${chartData.crossoverYear}</strong>.</p>
           `; 
break;

case 'optimal-strategy':
displayTitle = 'Winning the Financial Race';
paiVsTraditionalContainer.classList.remove('hidden');
summaryHTML = `
               <h4 class="text-sm font-bold text-center mb-2">Result Summary</h4>
               <p class="text-xs text-center">This optimal strategy generates a net wealth of <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong>.</p>
           `;
break;

case 'min-time-repay':
displayTitle = 'Race to Zero Debt: The Traditional Approach';
paiVsTraditionalContainer.classList.add('hidden');

//  2. Assign the custom HTML to our new variable.
explanationHTML = `
               <h4 class="text-lg font-bold text-textdark mb-2 pt-4">${displayTitle}</h4>
               <p>This chart visualizes the traditional strategy of eliminating debt as quickly as possible. By dedicating your entire monthly budget towards the loan, you can become debt-free in just <strong>${displayTenure}</strong>.</p>
               <p class="mt-2">After the loan is repaid, investing that same monthly amount for the remainder of your planning horizon could generate a final wealth of <strong class="text-investment_green">₹${scenario.futureValue.toLocaleString('en-IN')}</strong>.</p>
           `;

summaryHTML = `
               <h4 class="text-sm font-bold text-center mb-2">Result Summary</h4>
               <p class="text-xs text-center">Loan will be paid off in <strong class="text-investment_green">${displayTenure}</strong>.</p>
               <p class="text-xs text-center mt-1">Net wealth after horizon: <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong>.</p>
           `;
break;
}

// --- 4. RENDER GOAL-SPECIFIC CONTENT ---

// 3. Set the innerHTML only once, using our variable.
// If the variable is empty (for other goals), it creates the default explanation.
chartExplanation.innerHTML = explanationHTML || `
       <h4 class="text-lg font-bold text-textdark mb-2 pt-4">${displayTitle}</h4>
       <p>This chart visualizes the power of your strategy. At the end of the term, your loan balance will be <strong>₹0</strong>, while your investment is projected to grow to <strong>₹${scenario.futureValue.toLocaleString('en-IN')}</strong>.</p>
       <p class="mt-2">${crossoverYearText}</p>
   `;

amortizationExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">Loan Amortization Schedule</h4>
            <p>An amortization schedule shows how your loan payments are broken down over time. You can see how much of your annual payments go towards the principal versus the interest, and how your loan balance decreases each year until it reaches zero.</p>
            <p class="mt-2">Please note that this schedule is based on your regular EMI payments. If you make any part payments towards your loan, the schedule will change, and you will pay off your loan even faster.</p>
        `;

if (selectedGoal !== 'planner' && selectedGoal !== 'min-time-repay') {
const paiVsTraditionalData = generatePaiVsTraditionalData(scenario, selectedGoal);


// FIX: Get final values directly from the chart's data source
const traditionalNetWealth = paiVsTraditionalData.traditionalData[paiVsTraditionalData.traditionalData.length - 1];

     
renderPaiVsTraditionalChart(paiVsTraditionalData);
paiVsTraditionalExplanation.innerHTML = `<h4 class="text-lg font-bold text-textdark mb-2 pt-4">PaiFinance vs. Traditional Loan Repayment Strategy</h4>
       <p>This chart shows the power of the PaiFinance approach. The same monthly budget, when properly allocated across the right investing channels, can produce a more fruitful result shown by the <span class="font-semibold text-investment_green">green line</span> where the PaiFinance strategy helps you build positive net wealth of <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong> by the end of the planning horizon.<p class="mt-2"> The <span class="font-semibold text-danger">red line</span> shows how your net financial position gets worse over time with a traditional loan repayment strategy of repaying the loan fast, ending with a netwealth of <strong class="text-danger">₹${Math.round(traditionalNetWealth).toLocaleString('en-IN')}</strong> by the end of the planning horizon.</p>
      `;
}

summaryResultsContainer.classList.remove('hidden');
summaryResultsContainer.innerHTML = summaryHTML + `
       <button id="connectExpertBtn" class="w-full mt-4 bg-transparent border-2 border-investment_green text-investment_green font-semibold py-2 px-4 rounded-lg hover:bg-investment_green hover:text-white transition-colors duration-300">
       Connect to an Expert
       </button>
   `;

const connectExpertBtn = document.getElementById('connectExpertBtn');
if(connectExpertBtn) {
connectExpertBtn.addEventListener('click', () => {
document.getElementById('expertModal').classList.remove('hidden', 'flex');
document.getElementById('expertModal').classList.add('flex');
});
}
}


function renderWidgetCharts(scenario, totalInvested, totalGains) {
const loanCtx = document.getElementById('loanWidgetChart').getContext('2d');
if (loanWidgetChart) loanWidgetChart.destroy();
loanWidgetChart = new Chart(loanCtx, {
type: 'doughnut',
data: { labels: ['Principal', 'Interest'], datasets: [{ data: [scenario.principal, scenario.totalInterestPaid], backgroundColor: ['rgba(154, 133, 225, 0.5)', '#E5E7EB'], borderWidth: 0, }] },
options: { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
});

const investmentCtx = document.getElementById('investmentWidgetChart').getContext('2d');
if (investmentWidgetChart) investmentWidgetChart.destroy();
const totalInvestmentAmount = scenario.postLoanMonthlyInvestment ? (scenario.postLoanMonthlyInvestment * scenario.investmentTenure * 12) : totalInvested;
investmentWidgetChart = new Chart(investmentCtx, {
type: 'doughnut',
data: { labels: ['Invested', 'Gains'], datasets: [{ data: [totalInvestmentAmount, totalGains], backgroundColor: ['rgba(27, 146, 114, 0.5)', '#E5E7EB'], borderWidth: 0, }] },
options: { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
});
}

function updatePieChart(emi, investment) {
chartMessage.style.display = 'none';
const data = { labels: ['EMI', 'Investment'], datasets: [{ data: [emi, investment], backgroundColor: ['rgba(154, 133, 225, 0.75)', 'rgba(27, 146, 114, 0.75)'], borderColor: '#F9FAFB', borderWidth: 2 }] };
if (monthlyBudgetChart) {
monthlyBudgetChart.data = data;
monthlyBudgetChart.update();
} else {
monthlyBudgetChart = new Chart(chartCanvas, { type: 'doughnut', data: data, options: { responsive: true, maintainAspectRatio: true, cutout: '60%', plugins: { title: { display: true, text: 'Monthly Budget Allocation', align: 'center', font: { size: 18, weight: 'normal' }, color: '#1F2937', padding: { bottom: 16 } }, legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'rectRounded' } } } } });
}
}

function syncAndStyle(inputElement, sliderElement) {
const updateSliderVisuals = () => {
if (!sliderElement) return;
const min = parseFloat(sliderElement.min);
const max = parseFloat(sliderElement.max);
const value = parseFloat(sliderElement.value);
const progress = ((value - min) / (max - min)) * 100;
sliderElement.style.setProperty('--range-progress', `${progress}%`);
};

sliderElement.addEventListener('input', () => { 
inputElement.value = sliderElement.value; 
updateSliderVisuals(); 
triggerCalculation();
});
inputElement.addEventListener('input', () => {
const val = parseFloat(inputElement.value);
if (!isNaN(val) && val >= parseFloat(sliderElement.min) && val <= parseFloat(sliderElement.max)) {
sliderElement.value = inputElement.value;
updateSliderVisuals();
triggerCalculation();
}
});
updateSliderVisuals();
}

function triggerCalculation() {
const selectedGoal = document.querySelector('.goal-button.selected').dataset.goal;
if (selectedGoal === 'planner') {
runPlannerMode();
} else if (selectedGoal === 'min-time-repay') {
findMinTimeToRepay();
} else if (selectedGoal === 'min-time') {
findMinimumTime();
} else if (selectedGoal === 'optimal-strategy') {
findOptimalStrategy();
}
}

function updateSliderProgress(slider) {
if (!slider) return;
const min = parseFloat(slider.min);
const max = parseFloat(slider.max);
const value = parseFloat(slider.value)
const progress = ((value - min) / (max - min)) * 100;
slider.style.setProperty('--range-progress', `${progress}%`);
}

function handleGoalSelection(selectedButton) {
goalButtons.forEach(button => button.classList.remove('selected'));
selectedButton.classList.add('selected');
const goal = selectedButton.dataset.goal;
const isPlannerMode = goal === 'planner';

loanTenureInput.readOnly = !isPlannerMode;
investmentTenureInput.readOnly = !isPlannerMode;
loanTenureSlider.disabled = !isPlannerMode;
investmentTenureSlider.disabled = !isPlannerMode;

loanTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
investmentTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';

investmentTenureLabel.textContent = (goal === 'min-time-repay') ? 'Remaining Planning Horizon' : 'Investment Tenure';

if(isPlannerMode) {
loanTenureInput.value = `${loanTenureSlider.value} Yr`;
investmentTenureInput.value = `${investmentTenureSlider.value} Yr`;
}

triggerCalculation();
}

function generateComparisonData(scenario,selectedGoal) {
const labels = [];
const loanData = [];
const investmentData = [];
let remainingLoan = scenario.principal;
let investmentValue = 0;
let crossoverYear = null;
const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;
let horizonMonths = 0;
if (selectedGoal === 'planner') {
    // For manual mode, the horizon is the LONGER of the two tenures
    horizonMonths = Math.ceil(Math.max(scenario.tenure, scenario.investmentTenure) * 12);
} else if (selectedGoal === 'min-time-repay' || selectedGoal === 'optimal-strategy') {
    // For these goals, the horizon is the overall planning period
    horizonMonths = planningHorizon * 12;
} else {
    // For 'min-time-offset', the horizon is the calculated tenure to break even
    horizonMonths = Math.ceil(scenario.tenure * 12);
}
     
for (let year = 0; year <= Math.ceil(horizonMonths / 12); year++) {
labels.push(`Yr ${year}`);
loanData.push(remainingLoan > 0 ? remainingLoan : 0);
investmentData.push(investmentValue);

if (investmentValue > remainingLoan && crossoverYear === null && remainingLoan > 0) {
crossoverYear = year;
}

for (let month = 1; month <= 12; month++) {
const currentMonth = (year * 12) + month;
if (remainingLoan > 0) {
const interest = remainingLoan * monthlyLoanRate;
const principalPaid = scenario.emi - interest;
remainingLoan -= principalPaid;
}

let currentMonthlyInvestment = 0;
if (scenario.postLoanMonthlyInvestment) {
if (currentMonth > (scenario.tenure * 12)) {
currentMonthlyInvestment = scenario.postLoanMonthlyInvestment;
}
} else {
currentMonthlyInvestment = scenario.monthlyInvestment || 0;
}
investmentValue = (investmentValue + currentMonthlyInvestment) * (1 + monthlyInvestmentRate);
}
}
return { labels, loanData, investmentData, crossoverYear };
}

function renderComparisonChart(data) {
if (comparisonChart) comparisonChart.destroy();
comparisonChart = new Chart(comparisonChartCanvas, {
type: 'line',
data: {
labels: data.labels,
datasets: [
{ label: 'Loan Balance', data: data.loanData, borderColor: '#9a85e1', backgroundColor: 'rgba(154, 133, 225, 0.1)', fill: true, tension: 0.3 },
{ label: 'Investment Value', data: data.investmentData, borderColor: '#1B9272', backgroundColor: 'rgba(27, 146, 114, 0.1)', fill: true, tension: 0.3 }
]
},
options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: function(value) { return `₹${(value / 100000).toFixed(0)}L`; } } } } }
});
}

function generateAmortizationSchedule(scenario) {
const schedule = [];
let remainingLoan = scenario.principal;
const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;

for (let year = 1; year <= Math.ceil(scenario.tenure); year++) {
let yearlyInterest = 0;
let yearlyPrincipal = 0;
for (let month = 1; month <= 12; month++) {
if (remainingLoan > 0) {
const interest = remainingLoan * monthlyLoanRate;
const emiForThisMonth = Math.min(scenario.emi, remainingLoan + interest);
const principalPaid = emiForThisMonth - interest;
yearlyInterest += interest;
yearlyPrincipal += principalPaid;
remainingLoan -= principalPaid;
}
}
schedule.push({ year, principal: Math.round(yearlyPrincipal), interest: Math.round(yearlyInterest), balance: Math.round(remainingLoan > 0 ? remainingLoan : 0) });
}
return schedule;
}

function renderAmortizationTable(data) {
let tableHTML = `<table class="w-full text-sm text-left"><thead class="text-xs text-textdark uppercase bg-gray-50 sticky top-0"><tr><th scope="col" class="px-6 py-3">Year</th><th scope="col" class="px-6 py-3">Principal Paid</th><th scope="col" class="px-6 py-3">Interest Paid</th><th scope="col" class="px-6 py-3">Ending Balance</th></tr></thead><tbody>`;
data.forEach(row => {
tableHTML += `<tr class="bg-white border-b"><td class="px-6 py-4 font-semibold">${row.year}</td><td class="px-6 py-4 font-semibold">₹${row.principal.toLocaleString('en-IN')}</td><td class="px-6 py-4 font-semibold">₹${row.interest.toLocaleString('en-IN')}</td><td class="px-6 py-4 font-semibold">₹${row.balance.toLocaleString('en-IN')}</td></tr>`;
});
tableHTML += `</tbody></table>`;
amortizationTableContainer.innerHTML = tableHTML;
}

function generatePaiVsTraditionalData(scenario, selectedGoal) {
const labels = [];
const paiData = [];
const traditionalData = [];

// --- PAI (PARALLEL) METHOD VARIABLES ---
let paiInvestmentValue = 0;
let paiCumulativeInterest = 0;
let paiRemainingLoan = scenario.principal;

// --- TRADITIONAL (SEQUENTIAL) METHOD VARIABLES ---
const totalBudget = scenario.emi + (scenario.monthlyInvestment || 0); // Define the total budget once
const traditionalLoanPayoffMonths = calculateTenureMonths(scenario.principal, scenario.loanAnnualRate, totalBudget);
let traditionalInvestmentValue = 0;
let traditionalCumulativeInterest = 0;
let traditionalRemainingLoan = scenario.principal;

const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;
const horizonYears = (selectedGoal === 'min-time') ? scenario.tenure : planningHorizon;
const totalHorizonMonths = Math.ceil(horizonYears * 12);
    

for (let year = 0; year <= Math.ceil(horizonYears); year++) {
labels.push(`Yr ${year}`);
paiData.push(paiInvestmentValue - paiCumulativeInterest);
traditionalData.push(traditionalInvestmentValue - traditionalCumulativeInterest);

for (let month = 1; month <= 12; month++) {
const currentMonth = (year * 12) + month;

// --- PAI (PARALLEL) METHOD CALCULATION ---
if (currentMonth <= scenario.tenure * 12 && paiRemainingLoan > 0) {
const interest = paiRemainingLoan * monthlyLoanRate;
paiCumulativeInterest += interest;
const principalPaid = scenario.emi - interest;
paiRemainingLoan -= principalPaid;
}
if(currentMonth <= totalHorizonMonths) {
                    paiInvestmentValue = (paiInvestmentValue + (scenario.monthlyInvestment || 0)) * (1 + monthlyInvestmentRate);
                 }     

// --- TRADITIONAL (SEQUENTIAL) METHOD CALCULATION ---
if (currentMonth <= traditionalLoanPayoffMonths) {
// Phase 1: Loan Payoff
if (traditionalRemainingLoan > 0) {
const interest = traditionalRemainingLoan * monthlyLoanRate;
traditionalCumulativeInterest += interest;
const principalPaid = totalBudget - interest;
traditionalRemainingLoan -= principalPaid;
}
} else if(currentMonth <= totalHorizonMonths)  {
// Phase 2: Investment
traditionalInvestmentValue = (traditionalInvestmentValue + totalBudget) * (1 + monthlyInvestmentRate);
}
}
}
return { labels, paiData, traditionalData };
}

function renderPaiVsTraditionalChart(data) {
if (paiVsTraditionalChart) paiVsTraditionalChart.destroy();
paiVsTraditionalChart = new Chart(paiVsTraditionalChartCanvas, {
type: 'line',
data: {
labels: data.labels,
datasets: [
{ label: 'PaiFinance Net Wealth', data: data.paiData, borderColor: '#1B9272', backgroundColor: 'rgba(27, 146, 114, 0.1)', fill: true, tension: 0.3 },
{ label: 'Traditional Net Wealth', data: data.traditionalData, borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.3 }
]
},
options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: function(value) { return `₹${(value / 100000).toFixed(0)}L`; } } } } }
});
}


// --- 5. INITIALIZATION ---
function initializeApp() {
['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay'].forEach(id => {
const inputEl = document.getElementById(id);
const sliderEl = document.getElementById(id.replace('Display', '') + 'Slider');
if(inputEl && sliderEl) syncAndStyle(inputEl, sliderEl);
});

[loanTenureSlider, investmentTenureSlider].forEach(slider => {
slider.addEventListener('input', () => {
if (!slider.disabled) {
const correspondingInput = slider.id === 'loanTenureSlider' ? loanTenureInput : investmentTenureInput;
correspondingInput.value = `${slider.value} Y`;
triggerCalculation();
}
});
});

[loanTenureInput, investmentTenureInput].forEach(input => {
input.addEventListener('input', () => {
if (!input.readOnly) {
const correspondingSlider = input.id === 'loanTenureDisplay' ? loanTenureSlider : investmentTenureSlider;
const val = parseFloat(input.value);
if (!isNaN(val) && val >= parseFloat(correspondingSlider.min) && val <= parseFloat(correspondingSlider.max)) {
correspondingSlider.value = val;
updateSliderProgress(correspondingSlider);
triggerCalculation();
}
}
});
});

document.addEventListener('onboardingComplete', (e) => {
const { budget, tenure } = e.detail;
monthlyBudgetInput.value = budget;
planningHorizon = tenure;
updateSliderProgress(monthlyBudgetSlider);
triggerCalculation();
});

goalButtons.forEach(button => { button.addEventListener('click', () => handleGoalSelection(button)); });
finalResultsSection.classList.add('hidden');
handleGoalSelection(document.querySelector('.goal-button.selected'));
}

initializeApp();
});
