/**
 * PaiFinance - Interactive Script
 * Version: 18.0 - Conditional UI Fix
 * Last updated: September 6, 2025, 1:05 AM IST
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
    
    // Both Tenure and Horizon containers are now needed
    const loanTenureContainer = document.getElementById('loanTenureContainer');
    const loanTenureInput = document.getElementById('loanTenureDisplay');
    const loanTenureSlider = document.getElementById('loanTenureSlider');
    const investmentTenureContainer = document.getElementById('investmentTenureContainer');
    const investmentTenureInput = document.getElementById('investmentTenureDisplay');
    const investmentTenureSlider = document.getElementById('investmentTenureSlider');
    const planningHorizonContainer = document.getElementById('planningHorizonContainer');
    const planningHorizonInput = document.getElementById('planningHorizonDisplay');
    const planningHorizonSlider = document.getElementById('planningHorizonSlider');
    
    // Conditional elements
    const prepaymentRow = document.getElementById('prepaymentRow');
    const prepaymentResult = document.getElementById('prepaymentResult');
    const investmentSubtitle = document.getElementById('investmentSubtitle');

    const emiResultElement = document.getElementById('emiResult');
    const monthlyInvestmentResult = document.getElementById('monthlyInvestmentResult');
    
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

    // --- 3. GOAL-BASED CALCULATION STRATEGIES ---
    function runPlannerMode() {
        finalResultsSection.classList.remove('hidden');
        comparisonChartContainer.classList.remove('hidden');
        amortizationContainer.classList.remove('hidden');
        paiVsTraditionalContainer.classList.add('hidden');
        updatePlannerResults();
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
                displayResults(bestScenario, 'Winning the Financial Race');
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found. Your budget might be too low for the loan amount.</div>`;
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
                if (emi > budget || emi <= 0) continue;
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
                const years = Math.floor(foundScenario.tenure);
                const remainingMonths = Math.round((foundScenario.tenure - years) * 12);
                const tenureString = `${years} Years, ${remainingMonths} Months`;
                displayResults(foundScenario, 'The Race to Zero Debt', tenureString);
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-warning">Cannot offset interest within 30 years. Try increasing your budget or investment return rate.</div>`;
            }
        }, 500);
    }

    function calculateFastestRepayment() {
        finalResultsSection.classList.remove('hidden');
        comparisonChartContainer.classList.remove('hidden');
        amortizationContainer.classList.remove('hidden');
        paiVsTraditionalContainer.classList.add('hidden');

        const principal = parseFloat(loanAmountInput.value);
        const budget = parseFloat(monthlyBudgetInput.value);
        const loanAnnualRate = parseFloat(loanInterestRateInput.value);
        const investmentAnnualRate = parseFloat(investmentRateInput.value);
        const planningHorizonYears = parseFloat(planningHorizonInput.value);
        
        const minEmi = calculateEMI(principal, loanAnnualRate, 30);
        if (budget < minEmi) {
            mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Your budget of ₹${budget.toLocaleString('en-IN')} is too low to pay the minimum required EMI of ₹${minEmi.toLocaleString('en-IN')}.</div>`;
            return;
        }

        const monthlyLoanRate = loanAnnualRate / 100 / 12;
        let acceleratedTenureMonths = 0;
        if (monthlyLoanRate > 0) {
             acceleratedTenureMonths = -Math.log(1 - (principal * monthlyLoanRate) / budget) / Math.log(1 + monthlyLoanRate);
        } else {
            acceleratedTenureMonths = principal / budget;
        }
        
        const acceleratedTenureYears = acceleratedTenureMonths / 12;

        if (acceleratedTenureYears > planningHorizonYears) {
             mainResultsContainer.innerHTML = `<div class="text-center p-4 text-warning">Loan cannot be repaid within your ${planningHorizonYears}-year planning horizon. It will take approx. ${Math.ceil(acceleratedTenureYears)} years.</div>`;
        }

        const investmentYears = Math.max(0, planningHorizonYears - acceleratedTenureYears);
        const futureValue = calculateFutureValue(budget, investmentAnnualRate, investmentYears);

        const totalInterestPaid = (budget * acceleratedTenureMonths) - principal;
        const netWealth = futureValue - totalInterestPaid;
        
        const years = Math.floor(acceleratedTenureYears);
        const months = Math.ceil((acceleratedTenureYears - years) * 12);
        const tenureString = `${years} Years, ${months} Months`;
        
        const scenario = {
            tenure: acceleratedTenureYears,
            emi: minEmi,
            monthlyInvestment: budget,
            totalInterestPaid: totalInterestPaid > 0 ? totalInterestPaid : 0,
            futureValue: futureValue,
            netWealth: netWealth,
            principal: principal,
            loanAnnualRate: loanAnnualRate,
            investmentAnnualRate: investmentAnnualRate,
            investmentTenure: investmentYears
        };

        prepaymentResult.textContent = `₹ ${(budget - minEmi).toLocaleString('en-IN')}`;
        monthlyInvestmentResult.textContent = `₹ ${budget.toLocaleString('en-IN')}`;
        emiResultElement.textContent = `₹ ${minEmi.toLocaleString('en-IN')}`;

        displayResults(scenario, 'Fastest Debt Freedom', tenureString);
    }

    // --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---
    function updatePlannerResults() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(loanInterestRateInput.value);
        const tenureYears = parseFloat(loanTenureInput.value);
        const budget = parseFloat(monthlyBudgetInput.value);
        const investmentRate = parseFloat(investmentRateInput.value);
        const investmentTenureYears = parseFloat(investmentTenureInput.value);
        const emi = calculateEMI(principal, annualRate, tenureYears);
        const investment = (budget >= emi) ? budget - emi : 0;
        const totalInterestPaid = (emi * tenureYears * 12) - principal;
        const futureValue = calculateFutureValue(investment, investmentRate, investmentTenureYears);
        const netWealth = futureValue - totalInterestPaid;
        const scenario = { tenure: tenureYears, investmentTenure: investmentTenureYears, emi, monthlyInvestment: investment, totalInterestPaid, futureValue, netWealth, principal, loanAnnualRate: annualRate, investmentAnnualRate: investmentRate };
        displayResults(scenario, 'Your Strategy Visualised');
    }

    function displayResults(scenario, title, tenureString = null) {
        const displayTenure = tenureString || `${scenario.tenure} Years`;
        emiResultElement.textContent = `₹ ${scenario.emi.toLocaleString('en-IN')}`;
        monthlyInvestmentResult.textContent = `₹ ${scenario.monthlyInvestment.toLocaleString('en-IN')}`;
        updatePieChart(scenario.emi, scenario.monthlyInvestment);
        
        if (title === 'Winning the Financial Race' || title === 'The Race to Zero Debt') {
            const tenureValue = Math.ceil(scenario.tenure);
            loanTenureInput.value = tenureValue;
            investmentTenureInput.value = tenureValue;
            loanTenureSlider.value = tenureValue;
            investmentTenureSlider.value = tenureValue;
            updateSliderProgress(loanTenureSlider, tenureValue);
            updateSliderProgress(investmentTenureSlider, tenureValue);
        }
        
        const investmentTenureForCalc = scenario.investmentTenure || scenario.tenure;
        const totalInvested = scenario.monthlyInvestment * Math.round(investmentTenureForCalc * 12);
        const totalGains = scenario.futureValue - totalInvested;
        const totalPaid = scenario.principal + scenario.totalInterestPaid;
        
        mainResultsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${createWidgetCard('Loan Details', scenario, 'primary', displayTenure)}
                ${createWidgetCard('Investment Details', scenario, 'success', displayTenure, totalInvested, totalGains)}
                ${createResultCard('Net Money Input', scenario, 'warning', totalInvested, totalPaid)}
                ${createResultCard('Net Money Output', scenario, 'success', totalInvested, totalGains)}
            </div>
        `;

        renderWidgetCharts(scenario, totalInvested, totalGains);
        const chartData = generateComparisonData(scenario);
        renderComparisonChart(chartData);

        const crossoverYearText = chartData.crossoverYear ? `The key moment is in <strong>Year ${chartData.crossoverYear}</strong>, where your investment value is projected to surpass your outstanding loan balance. This means that if you were to liquidate your investment at this point to pay off the remaining loan, you could potentially become completely debt-free in just ${chartData.crossoverYear} years, significantly ahead of schedule.` : '';

        chartExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">${title}</h4>
            <p>This chart visualizes the power of your strategy. At the end of the term, your loan balance will be <strong>₹0</strong>, while your investment is projected to grow to <strong>₹${scenario.futureValue.toLocaleString('en-IN')}</strong>.</p>
            <p class="mt-2">${crossoverYearText}</p>
        `;

        const amortizationData = generateAmortizationSchedule(scenario);
        renderAmortizationTable(amortizationData);
        amortizationExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">Loan Amortization Schedule</h4>
            <p>An amortization schedule shows how your loan payments are broken down over time. You can see how much of your annual payments go towards the principal versus the interest, and how your loan balance decreases each year until it reaches zero.</p>
            <p class="mt-2">Please note that this schedule is based on your regular EMI payments. If you make any part payments towards your loan, the schedule will change, and you will pay off your loan even faster.</p>
        `;

        if (title !== 'Your Strategy Visualised' && title !== 'Fastest Debt Freedom') {
            const paiVsTraditionalData = generatePaiVsTraditionalData(scenario);
            renderPaiVsTraditionalChart(paiVsTraditionalData);
            paiVsTraditionalExplanation.innerHTML = `
                <h4 class="text-lg font-bold text-textdark mb-2 pt-4">PaiFinance vs. Traditional Loans</h4>
                <p>This chart shows the power of the PaiFinance approach. The same monthly budget, when properly allocated across the right investing channels, can produce a more fruitful result. The <span class="font-semibold text-danger">red line</span> shows how your net financial position gets worse over time with a traditional loan, ending at <strong class="text-danger">-₹${Math.round(scenario.totalInterestPaid).toLocaleString('en-IN')}</strong>.</p>
                <p class="mt-2">The <span class="font-semibold text-investment_green">green line</span> shows how the PaiFinance strategy helps you build positive net wealth, ending at <strong class="text-investment_green">₹${Math.round(scenario.netWealth).toLocaleString('en-IN')}</strong>. This is the financial advantage of using PaiFinance.</p>
            `;
        }
        
        updateSummaryBox(scenario, title, displayTenure, chartData.crossoverYear);
    }

    function createResultCard(title, scenario, color, totalInvested, totalPaidOrGains) {
        let content;
        if (title === 'Net Money Input') {
            const totalPaid = totalPaidOrGains;
            content = `
                <table class="w-full text-xs">
                    <tbody>
                        <tr><td class="text-left py-1">Total EMIs</td><td class="text-right font-semibold">₹${Math.round(totalPaid).toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left py-1">Total Investments</td><td class="text-right font-semibold">₹${totalInvested.toLocaleString('en-IN')}</td></tr>
                        <tr class="bg-gray-100 rounded"><td class="text-left font-bold p-1">Total Outflow</td><td class="text-right font-bold p-1">₹${Math.round(totalPaid + totalInvested).toLocaleString('en-IN')}</td></tr>
                    </tbody>
                </table>
            `;
        } else {
            const totalGains = totalPaidOrGains;
            content = `
                <table class="w-full text-xs">
                    <tbody>
                        <tr><td class="text-left py-1">Principal Received</td><td class="text-right font-semibold">₹${scenario.principal.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left py-1">Gains Made</td><td class="text-right font-semibold">₹${totalGains.toLocaleString('en-IN')}</td></tr>
                        <tr class="bg-gray-100 rounded"><td class="text-left font-bold p-1">Total Return</td><td class="text-right font-bold p-1">₹${(scenario.principal + totalGains).toLocaleString('en-IN')}</td></tr>
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
                        <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Interest</td><td class="text-right font-semibold text-emi_purple">₹${Math.round(scenario.totalInterestPaid).toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left font-bold py-1">Total Paid</td><td class="text-right font-bold text-textdark">₹${Math.round(scenario.principal + scenario.totalInterestPaid).toLocaleString('en-IN')}</td></tr>
                    </tbody>
                </table>
            `;
            canvasId = 'loanWidgetChart';
            percentage = Math.round((scenario.totalInterestPaid / (scenario.principal + scenario.totalInterestPaid)) * 100);
            percentageColor = 'text-textdark';
        } else {
            content = `
                <table class="w-full text-xs">
                    <tbody>
                        <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-investment_green mr-2"></span>Invested</td><td class="text-right font-semibold text-textdark">₹${totalInvested.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Gains</td><td class="text-right font-semibold text-investment_green">₹${totalGains.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left font-bold py-1">Total Wealth</td><td class="text-right font-bold text-textdark">₹${scenario.futureValue.toLocaleString('en-IN')}</td></tr>
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
        investmentWidgetChart = new Chart(investmentCtx, {
            type: 'doughnut',
            data: { labels: ['Invested', 'Gains'], datasets: [{ data: [totalInvested, totalGains], backgroundColor: ['rgba(27, 146, 114, 0.5)', '#E5E7EB'], borderWidth: 0, }] },
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
        const updateSlider = () => {
            const min = parseFloat(sliderElement.min);
            const max = parseFloat(sliderElement.max);
            const value = parseFloat(sliderElement.value);
            const progress = ((value - min) / (max - min)) * 100;
            sliderElement.style.setProperty('--range-progress', `${progress}%`);
        };
        sliderElement.addEventListener('input', () => { inputElement.value = sliderElement.value; updateSlider(); triggerCalculation(); });
        inputElement.addEventListener('input', () => { if (parseFloat(inputElement.value) >= parseFloat(sliderElement.min) && parseFloat(inputElement.value) <= parseFloat(sliderElement.max)) { sliderElement.value = inputElement.value; updateSlider(); triggerCalculation(); } });
        updateSlider();
    }
    
    function updateSliderProgress(slider, value) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const progress = ((value - min) / (max - min)) * 100;
        slider.style.setProperty('--range-progress', `${progress}%`);
    }

    function handleGoalSelection(selectedButton) {
        goalButtons.forEach(button => button.classList.remove('selected'));
        selectedButton.classList.add('selected');
        const goal = selectedButton.dataset.goal;

        loanTenureContainer.style.opacity = '1';
        loanTenureInput.disabled = false;
        loanTenureSlider.disabled = false;
        investmentTenureContainer.classList.remove('hidden');
        planningHorizonContainer.classList.add('hidden');
        prepaymentRow.classList.add('hidden');
        investmentSubtitle.classList.add('hidden');
        
        if (goal === 'min-time-repay') {
            planningHorizonContainer.classList.remove('hidden');
            prepaymentRow.classList.remove('hidden');
            prepaymentRow.classList.add('flex');
            investmentSubtitle.classList.remove('hidden');
            investmentTenureContainer.classList.add('hidden');
            loanTenureContainer.style.opacity = '0.5';
            loanTenureInput.disabled = true;
            loanTenureSlider.disabled = true;
        } else if (goal !== 'planner') {
            loanTenureContainer.style.opacity = '0.5';
            loanTenureInput.disabled = true;
            loanTenureSlider.disabled = true;
        }
        triggerCalculation();
    }

    function triggerCalculation() {
        clearTimeout(calculationTimeout);
        calculationTimeout = setTimeout(() => {
            const selectedGoal = document.querySelector('.goal-button.selected').dataset.goal;
            if (selectedGoal === 'planner') { runPlannerMode(); } 
            else if (selectedGoal === 'min-time') { findMinimumTime(); } 
            else if (selectedGoal === 'optimal-strategy') { findOptimalStrategy(); } 
            else if (selectedGoal === 'min-time-repay') { calculateFastestRepayment(); }
        }, 250);
    }
    
    function generateComparisonData(scenario) { /* ... same as before ... */ }
    function renderComparisonChart(data) { /* ... same as before ... */ }
    function generateAmortizationSchedule(scenario) { /* ... same as before ... */ }
    function renderAmortizationTable(data) { /* ... same as before ... */ }
    function generatePaiVsTraditionalData(scenario) { /* ... same as before ... */ }
    function renderPaiVsTraditionalChart(data) { /* ... same as before ... */ }
    function updateSummaryBox(scenario, title, displayTenure, crossoverYear) { /* ... same as before ... */ }

    // --- 5. INITIALIZATION ---
    document.addEventListener('onboardingComplete', (e) => {
        const { budget, tenure, loanAmount } = e.detail;
        monthlyBudgetInput.value = budget;
        monthlyBudgetSlider.value = budget;
        updateSliderProgress(monthlyBudgetSlider, budget);
        loanTenureInput.value = tenure;
        loanTenureSlider.value = tenure;
        updateSliderProgress(loanTenureSlider, tenure);
        investmentTenureInput.value = tenure;
        investmentTenureSlider.value = tenure;
        updateSliderProgress(investmentTenureSlider, tenure);
        planningHorizonInput.value = tenure;
        planningHorizonSlider.value = tenure;
        updateSliderProgress(planningHorizonSlider, tenure);
        loanAmountInput.value = loanAmount;
        loanAmountSlider.value = loanAmount;
        updateSliderProgress(loanAmountSlider, loanAmount);
        triggerCalculation();
    });

    function initializeApp() {
        const idsToSync = ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay', 'loanTenureDisplay', 'investmentTenureDisplay', 'planningHorizonDisplay'];
        idsToSync.forEach(id => {
            const input = document.getElementById(id);
            const slider = document.getElementById(id.replace('Display', '') + 'Slider');
            if (input && slider) {
                syncAndStyle(input, slider);
            }
        });
        goalButtons.forEach(button => { button.addEventListener('click', () => handleGoalSelection(button)); });
        finalResultsSection.classList.add('hidden');
        handleGoalSelection(document.querySelector('.goal-button.selected'));
    }

    initializeApp();
});
