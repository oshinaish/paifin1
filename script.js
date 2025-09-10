/**
 * PaiFinance - Interactive Script
 * Version: 21.0 - CHATBOT INTERACTIVITY
 * Last updated: September 10, 2025, 1:45 PM IST
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
    let planningHorizon = 20; // Default value, will be updated from onboarding

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
        comparisonChartContainer.classList.add('hidden');
        amortizationContainer.classList.remove('hidden');
        paiVsTraditionalContainer.classList.remove('hidden');
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
                summaryResultsContainer.classList.add('hidden');
                return;
            }

            const tenureMonths = calculateTenureMonths(principal, loanAnnualRate, budget);
            const loanTenureYears = tenureMonths / 12;

            if (loanTenureYears > totalPlanningHorizon) {
                 showWarningToast("Loan cannot be paid off within your planning horizon.");
                 mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Payoff time (${formatYearsAndMonths(loanTenureYears)}) exceeds your planning horizon.</div>`;
                 loanTenureInput.value = formatYearsAndMonths(loanTenureYears);
                 investmentTenureInput.value = "0 Years";
                 summaryResultsContainer.classList.add('hidden');
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
            displayResults(scenario, 'Min Time To Repay');
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
                displayResults(bestScenario, 'Winning the Financial Race');
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found. Your budget may be too low for this loan amount and interest rate.</div>`;
                summaryResultsContainer.classList.add('hidden');
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
                displayResults(foundScenario, 'The Race to Zero Debt', formatYearsAndMonths(foundScenario.tenure));
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Cannot offset interest within 30 years. Try increasing your budget or the investment return rate.</div>`;
                summaryResultsContainer.classList.add('hidden');
            }
        }, 500);
    }

    // --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---
    function updatePlannerResults() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(loanInterestRateInput.value);
        const tenureYears = parseFloat(loanTenureSlider.value);
        const budget = parseFloat(monthlyBudgetInput.value);
        const investmentRate = parseFloat(investmentRateInput.value);
        const investmentTenureYears = parseFloat(investmentTenureSlider.value);

        loanTenureInput.value = `${tenureYears} Y`;
        investmentTenureInput.value = `${investmentTenureYears} Y`;
        
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
        displayResults(scenario, 'Your Strategy Visualised');
    }
    
    function formatYearsAndMonths(decimalYears) {
        if (!decimalYears || decimalYears < 0) return "0 M";
        const years = Math.floor(decimalYears);
        const months = Math.round((decimalYears - years) * 12);
        if (years > 0 && months > 0) return `${years} Y, ${months} M`;
        if (years > 0) return `${years} Y`;
        if (months > 0) return `${months} M`;
        return "0 M";
    }

    function displayResults(scenario, title, tenureString = null) {
        const displayTenure = tenureString || formatYearsAndMonths(scenario.tenure);
        
        emiResultElement.textContent = `₹ ${scenario.emi.toLocaleString('en-IN')}`;
        
        if (title === 'Min Time To Repay') {
            monthlyInvestmentResult.textContent = `₹ ${scenario.postLoanMonthlyInvestment.toLocaleString('en-IN')}`;
            monthlyInvestmentSubtext.textContent = '(after loan)';
            monthlyInvestmentSubtext.classList.remove('hidden');
        } else {
            const investmentAmount = scenario.monthlyInvestment || 0;
            monthlyInvestmentResult.textContent = `₹ ${investmentAmount.toLocaleString('en-IN')}`;
            monthlyInvestmentSubtext.classList.add('hidden');
        }
        updatePieChart(scenario.emi, scenario.monthlyInvestment || 0);
        
        const investmentTenureForCalc = scenario.investmentTenure || scenario.tenure;
        const totalInvested = scenario.postLoanMonthlyInvestment 
            ? 0
            : (scenario.monthlyInvestment || 0) * Math.round(investmentTenureForCalc * 12);
            
        const totalGains = scenario.futureValue - (scenario.postLoanMonthlyInvestment ? (scenario.postLoanMonthlyInvestment * scenario.investmentTenure * 12) : totalInvested);
        const totalPaid = scenario.principal + scenario.totalInterestPaid;
        
        mainResultsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${createWidgetCard('Loan Details', scenario, 'primary', displayTenure)}
                ${createWidgetCard('Investment Details', scenario, 'success', formatYearsAndMonths(scenario.investmentTenure), totalInvested, totalGains)}
                ${createResultCard('Net Money Input', scenario, 'warning', totalInvested, totalPaid)}
                ${createResultCard('Net Money Output', scenario, 'success', totalInvested, totalGains)}
            </div>
        `;

        renderWidgetCharts(scenario, totalInvested, totalGains);
        const chartData = generateComparisonData(scenario);
        renderComparisonChart(chartData);

        const crossoverYearText = chartData.crossoverYear ? `The key moment is in <strong>Year ${chartData.crossoverYear}</strong>, where your investment value is projected to surpass your outstanding loan balance.` : '';

        chartExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">${title}</h4>
            <p>This chart visualizes the power of your strategy. Your loan balance will be <strong>₹0</strong> after ${displayTenure}, while your total wealth is projected to grow to <strong>₹${scenario.futureValue.toLocaleString('en-IN')}</strong> by the end of your planning horizon.</p>
            <p class="mt-2">${crossoverYearText}</p>
        `;

        const amortizationData = generateAmortizationSchedule(scenario);
        renderAmortizationTable(amortizationData);
        amortizationExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">Loan Amortization Schedule</h4>
            <p>This schedule shows how your accelerated payments quickly pay down your loan. You can see how much of your annual payments go towards the principal versus the interest until the loan is fully paid off.</p>
        `;
        
        if (title === 'Min Time To Repay') {
            paiVsTraditionalContainer.classList.remove('hidden');
            const netWealthData = generateNetWealthData(scenario);
            renderPaiVsTraditionalChart(netWealthData);
            paiVsTraditionalExplanation.innerHTML = `
                <h4 class="text-lg font-bold text-textdark mb-2 pt-4">Your Net Wealth Journey</h4>
                <p>This chart shows your financial journey. Your net wealth initially decreases as you pay interest. After the loan is paid off in <strong class="text-investment_green">${displayTenure}</strong>, your wealth grows rapidly as the entire budget is invested.</p>
            `;
        } else if (title !== 'Your Strategy Visualised') {
            paiVsTraditionalContainer.classList.remove('hidden');
            const paiVsTraditionalData = generatePaiVsTraditionalData(scenario);
            renderPaiVsTraditionalChart(paiVsTraditionalData);
            paiVsTraditionalExplanation.innerHTML = `
                <h4 class="text-lg font-bold text-textdark mb-2 pt-4">PaiFinance vs. Traditional Loans</h4>
                <p>The <span class="font-semibold text-danger">red line</span> shows your net position with a traditional loan, ending at <strong class="text-danger">-₹${scenario.totalInterestPaid.toLocaleString('en-IN')}</strong>.</p>
                <p class="mt-2">The <span class="font-semibold text-investment_green">green line</span> shows how this strategy helps you build positive net wealth, ending at <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong>.</p>
            `;
        } else {
             paiVsTraditionalContainer.classList.add('hidden');
        }
        
        updateSummaryBox(scenario, title, displayTenure, crossoverYear);
    }

    function createResultCard(title, scenario, color, totalInvested, totalPaidOrGains) {
        let content;
        if (title === 'Net Money Input') {
            const totalPaid = totalPaidOrGains;
            const totalOutflow = (scenario.postLoanMonthlyInvestment ? (scenario.postLoanMonthlyInvestment * scenario.investmentTenure * 12) : totalInvested) + totalPaid;
            content = `
                <table class="w-full text-xs">
                    <tbody>
                        <tr><td class="text-left py-1">Total EMIs</td><td class="text-right font-semibold">₹${totalPaid.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left py-1">Total Investments</td><td class="text-right font-semibold">₹${((scenario.postLoanMonthlyInvestment * scenario.investmentTenure * 12) || totalInvested).toLocaleString('en-IN')}</td></tr>
                        <tr class="bg-gray-100 rounded"><td class="text-left font-bold p-1">Total Outflow</td><td class="text-right font-bold p-1">₹${totalOutflow.toLocaleString('en-IN')}</td></tr>
                    </tbody>
                </table>
            `;
        } else {
            const totalGains = totalPaidOrGains;
             const totalReturn = scenario.principal + totalGains;
            content = `
                <table class="w-full text-xs">
                    <tbody>
                        <tr><td class="text-left py-1">Principal Received</td><td class="text-right font-semibold">₹${scenario.principal.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left py-1">Gains Made</td><td class="text-right font-semibold">₹${totalGains.toLocaleString('en-IN')}</td></tr>
                        <tr class="bg-gray-100 rounded"><td class="text-left font-bold p-1">Total Return</td><td class="text-right font-bold p-1">₹${totalReturn.toLocaleString('en-IN')}</td></tr>
                    </tbody>
                </table>
            `;
        }
        return `<div class="bg-card p-4 rounded-lg shadow-default"><h3 class="text-sm font-bold text-textdark mb-2 text-center">${title}</h3><div class="text-textlight leading-relaxed text-xs">${content}</div></div>`;
    }
    
    function createWidgetCard(title, scenario, color, displayTenure, totalInvested, totalGains) {
        let content, canvasId, percentage, percentageColor;
        if (title === 'Loan Details') {
            content = `
                <table class="w-full text-xs">
                    <tbody>
                        <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-emi_purple mr-2"></span>Principal</td><td class="text-right font-semibold text-textdark">₹${scenario.principal.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Interest</td><td class="text-right font-semibold text-emi_purple">₹${scenario.totalInterestPaid.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left font-bold py-1">Paid Off In</td><td class="text-right font-bold text-textdark">${displayTenure}</td></tr>
                    </tbody>
                </table>
            `;
            canvasId = 'loanWidgetChart';
            percentage = Math.round((scenario.totalInterestPaid / (scenario.principal + scenario.totalInterestPaid)) * 100);
            percentageColor = 'text-textdark';
        } else {
             const totalInvestmentAmount = scenario.postLoanMonthlyInvestment ? (scenario.postLoanMonthlyInvestment * scenario.investmentTenure * 12) : totalInvested;
            content = `
                <table class="w-full text-xs">
                    <tbody>
                        <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-investment_green mr-2"></span>Invested</td><td class="text-right font-semibold text-textdark">₹${totalInvestmentAmount.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Gains</td><td class="text-right font-semibold text-investment_green">₹${totalGains.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left font-bold py-1">Horizon</td><td class="text-right font-bold text-textdark">${displayTenure}</td></tr>
                    </tbody>
                </table>
            `;
            canvasId = 'investmentWidgetChart';
            percentage = scenario.futureValue > 0 ? Math.round((totalGains / scenario.futureValue) * 100) : 0;
            percentageColor = 'text-textdark';
        }

        return `
            <div class="bg-card p-4 rounded-lg shadow-default">
                <h3 class="text-sm font-bold text-textdark mb-2 text-center">${title}</h3>
                <div class="flex items-center gap-4">
                    <div class="w-20 h-20 relative flex-shrink-0">
                        <canvas id="${canvasId}"></canvas>
                        <div class="absolute inset-0 flex items-center justify-center text-base font-bold ${percentageColor}">
                            <span>${percentage}%</span>
                        </div>
                    </div>
                    <div class="text-textlight leading-relaxed w-full">
                        ${content}
                    </div>
                </div>
            </div>
        `;
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
            loanTenureInput.value = `${loanTenureSlider.value} Y`;
            investmentTenureInput.value = `${investmentTenureSlider.value} Y`;
        }

        triggerCalculation();
    }

    function generateComparisonData(scenario) {
        const labels = [];
        const loanData = [];
        const investmentData = [];
        let remainingLoan = scenario.principal;
        let investmentValue = 0;
        let crossoverYear = null;
        const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
        const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;
        const totalHorizonMonths = (scenario.tenure + (scenario.investmentTenure || 0)) * 12;

        for (let year = 0; year <= Math.ceil(totalHorizonMonths/12); year++) {
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
    
    function generateNetWealthData(scenario) {
        const labels = [];
        const netWealthData = [];
        let cumulativeInterest = 0;
        let investmentValue = 0;
        const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
        const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;
        let remainingLoan = scenario.principal;
        const totalHorizonMonths = (scenario.tenure + scenario.investmentTenure) * 12;

        for (let year = 0; year <= Math.ceil(totalHorizonMonths / 12); year++) {
            labels.push(`Yr ${year}`);
            netWealthData.push(investmentValue - cumulativeInterest);

            for (let month = 1; month <= 12; month++) {
                const currentMonth = (year * 12) + month;
                if (currentMonth <= scenario.tenure * 12) {
                    if (remainingLoan > 0) {
                        const interest = remainingLoan * monthlyLoanRate;
                        cumulativeInterest += interest;
                        const principalPaid = scenario.emi - interest;
                        remainingLoan -= principalPaid;
                    }
                } else {
                    investmentValue = (investmentValue + scenario.postLoanMonthlyInvestment) * (1 + monthlyInvestmentRate);
                }
            }
        }
        return { labels, netWealthData };
    }

    function generatePaiVsTraditionalData(scenario) {
        const labels = [];
        const paiData = [];
        const traditionalData = [];
        let investmentValue = 0;
        let cumulativeInterest = 0;
        const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;
        const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
        let remainingLoan = scenario.principal;
        const totalHorizonMonths = (scenario.tenure + (scenario.investmentTenure || 0)) * 12;

        for (let year = 0; year <= Math.ceil(totalHorizonMonths / 12); year++) {
            labels.push(`Yr ${year}`);
            paiData.push(investmentValue - cumulativeInterest);
            traditionalData.push(-cumulativeInterest);
            for (let month = 1; month <= 12; month++) {
                if (remainingLoan > 0) {
                    const interest = remainingLoan * monthlyLoanRate;
                    cumulativeInterest += interest;
                    const principalPaid = scenario.emi - interest;
                    remainingLoan -= principalPaid;
                }
                let currentMonthlyInvestment = scenario.monthlyInvestment || 0;
                investmentValue = (investmentValue + currentMonthlyInvestment) * (1 + monthlyInvestmentRate);
            }
        }
        return { labels, paiData, traditionalData };
    }

    function renderPaiVsTraditionalChart(data) {
        if (paiVsTraditionalChart) paiVsTraditionalChart.destroy();
        
        let datasets = [];
        if (data.netWealthData) {
            datasets.push({
                label: 'Net Wealth',
                data: data.netWealthData,
                borderColor: '#1B9272',
                backgroundColor: 'rgba(27, 146, 114, 0.1)',
                fill: true,
                tension: 0.3,
            });
        } else {
            datasets.push(
                { label: 'PaiFinance Net Wealth', data: data.paiData, borderColor: '#1B9272', backgroundColor: 'rgba(27, 146, 114, 0.1)', fill: true, tension: 0.3 },
                { label: 'Traditional Net Wealth', data: data.traditionalData, borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.3 }
            );
        }

        paiVsTraditionalChart = new Chart(paiVsTraditionalChartCanvas, {
            type: 'line',
            data: { labels: data.labels, datasets: datasets },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: function(value) { return `₹${(value / 100000).toFixed(0)}L`; } } } } }
        });
    }

    function updateSummaryBox(scenario, title, displayTenure, crossoverYear) {
        summaryResultsContainer.classList.remove('hidden');
        let summaryHTML = '';
        if (title === 'Your Strategy Visualised') {
            summaryHTML = `<h4 class="text-sm font-bold text-center mb-2">Result Summary</h4><p class="text-xs text-center">Net Wealth after ${displayTenure}: <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong></p>`;
        } else if (title === 'The Race to Zero Debt') {
            summaryHTML = `<h4 class="text-sm font-bold text-center mb-2">Result Summary</h4><p class="text-xs text-center">You can offset your loan interest in just <strong class="text-investment_green">${displayTenure}</strong>.</p><p class="text-xs text-center mt-1">You can become debt-free in <strong>Year ${crossoverYear}</strong>.</p>`;
        } else if (title === 'Winning the Financial Race') {
            summaryHTML = `<h4 class="text-sm font-bold text-center mb-2">Result Summary</h4><p class="text-xs text-center">This optimal strategy generates a net wealth of <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong>.</p>`;
        } else if (title === 'Min Time To Repay') {
             summaryHTML = `<h4 class="text-sm font-bold text-center mb-2">Result Summary</h4><p class="text-xs text-center">Loan will be paid off in <strong class="text-investment_green">${displayTenure}</strong>.</p><p class="text-xs text-center mt-1">Total wealth after horizon: <strong class="text-investment_green">₹${scenario.futureValue.toLocaleString('en-IN')}</strong>.</p>`;
        }
        
        summaryHTML += `
            <button id="connectExpertBtn" class="w-full mt-4 bg-investment_green text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors duration-300">
                Connect to an Expert
            </button>
        `;
        summaryResultsContainer.innerHTML = summaryHTML;

        const connectExpertBtn = document.getElementById('connectExpertBtn');
        const expertModal = document.getElementById('expertModal');
        if(connectExpertBtn && expertModal) {
            connectExpertBtn.addEventListener('click', () => {
                expertModal.classList.remove('hidden');
                expertModal.classList.add('flex');
            });
        }
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
