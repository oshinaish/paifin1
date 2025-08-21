/**
 * PaiFinance - Interactive Script
 * Version: 6.4 - Final Widget Polish
 * Last updated: August 19, 2025, 11:30 PM IST
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
    const emiResultElement = document.getElementById('emiResult');
    const monthlyInvestmentResult = document.getElementById('monthlyInvestmentResult');
    
    // Result Containers
    const finalResultsSection = document.getElementById('finalResultsSection');
    const mainResultsContainer = document.getElementById('mainResultsContainer');
    const comparisonChartContainer = document.getElementById('comparisonChartContainer');

    const chartsContainer = document.getElementById('chartsContainer');
    const goalButtons = document.querySelectorAll('.goal-button');
    const chartCanvas = document.getElementById('monthlyBudgetChart');
    const chartMessage = document.getElementById('chartMessage');
    const comparisonChartCanvas = document.getElementById('comparisonChart');
    let monthlyBudgetChart = null;
    let comparisonChart = null;
    let loanWidgetChart = null;
    let investmentWidgetChart = null;
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
        if (monthlyInvestment <= 0 || annualRate <= 0 || tenureYears <= 0) return 0;
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
        updatePlannerResults();
    }

    function findOptimalStrategy() {
        finalResultsSection.classList.remove('hidden');
        comparisonChartContainer.classList.remove('hidden');
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
                displayResults(bestScenario, 'Optimal Strategy');
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found.</div>`;
            }
        }, 500);
    }

    function findMinimumTime() {
        finalResultsSection.classList.remove('hidden');
        comparisonChartContainer.classList.remove('hidden');
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
                const years = Math.floor(foundScenario.tenure);
                const remainingMonths = Math.round((foundScenario.tenure - years) * 12);
                const tenureString = `${years} Years, ${remainingMonths} Months`;
                displayResults(foundScenario, 'Minimum Time', tenureString);
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Cannot offset interest within 30 years.</div>`;
            }
        }, 500);
    }

    // --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---
    function updatePlannerResults() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(loanInterestRateInput.value);
        const tenureYears = parseFloat(loanTenureInput.value);
        const budget = parseFloat(monthlyBudgetInput.value);
        const investmentRate = parseFloat(investmentRateInput.value);
        const emi = calculateEMI(principal, annualRate, tenureYears);
        const investment = (budget >= emi) ? budget - emi : 0;
        const totalInterestPaid = (emi * tenureYears * 12) - principal;
        const futureValue = calculateFutureValue(investment, investmentRate, tenureYears);
        const netWealth = futureValue - totalInterestPaid;
        const scenario = { tenure: tenureYears, emi, monthlyInvestment: investment, totalInterestPaid, futureValue, netWealth, principal, loanAnnualRate: annualRate, investmentAnnualRate: investmentRate };
        displayResults(scenario, 'Manual Plan');
    }

    function displayResults(scenario, title, tenureString = null) {
        const displayTenure = tenureString || `${scenario.tenure} Years`;
        emiResultElement.textContent = `₹ ${scenario.emi.toLocaleString('en-IN')}`;
        monthlyInvestmentResult.textContent = `₹ ${scenario.monthlyInvestment.toLocaleString('en-IN')}`;
        updatePieChart(scenario.emi, scenario.monthlyInvestment);
        if (title.includes('Optimal') || title.includes('Minimum')) {
            loanTenureInput.value = Math.ceil(scenario.tenure);
            investmentTenureInput.value = Math.ceil(scenario.tenure);
            loanTenureInput.dispatchEvent(new Event('input', { bubbles:true }));
            investmentTenureInput.dispatchEvent(new Event('input', { bubbles:true }));
        }
        
        const totalInvested = scenario.monthlyInvestment * Math.round(scenario.tenure * 12);
        const totalGains = scenario.futureValue - totalInvested;
        const totalPaid = scenario.principal + scenario.totalInterestPaid;
        
        mainResultsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${createWidgetCard('Loan Details', scenario, 'primary', displayTenure)}
                ${createWidgetCard('Investment Details', scenario, 'success', displayTenure, totalInvested, totalGains)}
                ${createResultCard('Net Money Input', scenario, 'warning', totalInvested, totalPaid)}
                ${createResultCard('Net Money Output', scenario, 'success', totalGains)}
            </div>
        `;

        // Now that the canvases are in the DOM, render the charts
        renderWidgetCharts(scenario, totalInvested, totalGains);

        const chartData = generateComparisonData(scenario);
        renderComparisonChart(chartData);
    }

    function createResultCard(title, scenario, color, totalInvested, totalPaid) {
        let content;
        if (title === 'Net Money Input') {
            content = `
                <table class="w-full text-xs">
                    <tr><td class="text-left py-1">Total EMIs</td><td class="text-right font-normal">₹${totalPaid.toLocaleString('en-IN')}</td></tr>
                    <tr><td class="text-left py-1">Total Investments</td><td class="text-right font-normal">₹${totalInvested.toLocaleString('en-IN')}</td></tr>
                    <tr class="bg-gray-100 rounded"><td class="text-left font-bold p-1">Total Outflow</td><td class="text-right font-bold p-1">₹${(totalPaid + totalInvested).toLocaleString('en-IN')}</td></tr>
                </table>
            `;
        } else {
            const totalGains = scenario.futureValue - totalInvested;
            content = `
                <table class="w-full text-xs">
                    <tr><td class="text-left py-1">Principal Received</td><td class="text-right font-normal">₹${scenario.principal.toLocaleString('en-IN')}</td></tr>
                    <tr><td class="text-left py-1">Gains Made</td><td class="text-right font-normal">₹${totalGains.toLocaleString('en-IN')}</td></tr>
                    <tr class="bg-gray-100 rounded"><td class="text-left font-bold p-1">Total Return</td><td class="text-right font-bold p-1">₹${(scenario.principal + totalGains).toLocaleString('en-IN')}</td></tr>
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
                    <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-emi_purple mr-2"></span>Principal</td><td class="text-right font-normal">₹${scenario.principal.toLocaleString('en-IN')}</td></tr>
                    <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Interest</td><td class="text-right font-normal">₹${scenario.totalInterestPaid.toLocaleString('en-IN')}</td></tr>
                    <tr><td class="text-left font-bold py-1">Total Paid</td><td class="text-right font-bold">₹${(scenario.principal + scenario.totalInterestPaid).toLocaleString('en-IN')}</td></tr>
                </table>
            `;
            canvasId = 'loanWidgetChart';
            percentage = Math.round((scenario.totalInterestPaid / (scenario.principal + scenario.totalInterestPaid)) * 100);
            percentageColor = 'text-textdark';
        } else {
            content = `
                <table class="w-full text-xs">
                    <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-investment_green mr-2"></span>Invested</td><td class="text-right font-normal">₹${totalInvested.toLocaleString('en-IN')}</td></tr>
                    <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Gains</td><td class="text-right font-normal">₹${totalGains.toLocaleString('en-IN')}</td></tr>
                    <tr><td class="text-left font-bold py-1">Total Wealth</td><td class="text-right font-bold">₹${scenario.futureValue.toLocaleString('en-IN')}</td></tr>
                </table>
            `;
            canvasId = 'investmentWidgetChart';
            percentage = Math.round((totalGains / scenario.futureValue) * 100);
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
        // Loan Chart
        const loanCtx = document.getElementById('loanWidgetChart').getContext('2d');
        if (loanWidgetChart) loanWidgetChart.destroy();
        loanWidgetChart = new Chart(loanCtx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [scenario.principal, scenario.totalInterestPaid],
                    backgroundColor: ['rgba(154, 133, 225, 0.5)', '#E5E7EB'],
                    borderWidth: 0,
                }]
            },
            options: { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });

        // Investment Chart
        const investmentCtx = document.getElementById('investmentWidgetChart').getContext('2d');
        if (investmentWidgetChart) investmentWidgetChart.destroy();
        investmentWidgetChart = new Chart(investmentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Invested', 'Gains'],
                datasets: [{
                    data: [totalInvested, totalGains],
                    backgroundColor: ['rgba(27, 146, 114, 0.5)', '#E5E7EB'],
                    borderWidth: 0,
                }]
            },
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
            monthlyBudgetChart = new Chart(chartCanvas, { type: 'doughnut', data: data, options: { responsive: true, maintainAspectRatio: true, cutout: '60%', plugins: { title: { display: true, text: 'Monthly Budget Allocation', align: 'center', font: { size: 18, weight: '600' }, color: '#1F2937', padding: { bottom: 16 } }, legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'rectRounded' } } } } });
        }
    }
    
    function syncAndStyle(inputElement, sliderElement) {
        const updateSliderProgress = () => {
            const min = parseFloat(sliderElement.min);
            const max = parseFloat(sliderElement.max);
            const value = parseFloat(sliderElement.value);
            const progress = ((value - min) / (max - min)) * 100;
            sliderElement.style.setProperty('--range-progress', `${progress}%`);
        };
        const handleInput = () => {
            const selectedGoal = document.querySelector('.goal-button.selected').dataset.goal;
            if (selectedGoal === 'planner') {
                runPlannerMode();
            } else {
                const principal = parseFloat(loanAmountInput.value);
                const budget = parseFloat(monthlyBudgetInput.value);
                const emi = calculateEMI(principal, parseFloat(loanInterestRateInput.value), parseFloat(loanTenureInput.value));
                const investment = (budget >= emi) ? budget - emi : 0;
                updatePieChart(emi, investment);
            }
        };
        sliderElement.addEventListener('input', () => { inputElement.value = sliderElement.value; updateSliderProgress(); handleInput(); });
        inputElement.addEventListener('input', () => {
            if (parseFloat(inputElement.value) >= parseFloat(sliderElement.min) && parseFloat(inputElement.value) <= parseFloat(sliderElement.max)) {
                sliderElement.value = inputElement.value;
                updateSliderProgress();
                handleInput();
            }
        });
        updateSliderProgress();
    }

    function handleGoalSelection(selectedButton) {
        goalButtons.forEach(button => button.classList.remove('selected'));
        selectedButton.classList.add('selected');
        const goal = selectedButton.dataset.goal;
        const isPlannerMode = goal === 'planner';
        [loanTenureInput, loanTenureSlider, investmentTenureInput, investmentTenureSlider].forEach(field => { field.disabled = !isPlannerMode; });
        loanTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        investmentTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        if (goal === 'planner') runPlannerMode();
        else if (goal === 'min-time') findMinimumTime();
        else if (goal === 'optimal-strategy') findOptimalStrategy();
    }

    function generateComparisonData(scenario) {
        const labels = [];
        const loanData = [];
        const investmentData = [];
        let remainingLoan = scenario.principal;
        let investmentValue = 0;
        const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
        const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;
        for (let year = 0; year <= Math.ceil(scenario.tenure); year++) {
            labels.push(`Year ${year}`);
            loanData.push(remainingLoan > 0 ? remainingLoan : 0);
            investmentData.push(investmentValue);
            for (let month = 1; month <= 12; month++) {
                if (remainingLoan > 0) {
                    const interest = remainingLoan * monthlyLoanRate;
                    const principalPaid = scenario.emi - interest;
                    remainingLoan -= principalPaid;
                }
                investmentValue = (investmentValue + scenario.monthlyInvestment) * (1 + monthlyInvestmentRate);
            }
        }
        return { labels, loanData, investmentData };
    }

    function renderComparisonChart(data) {
        if (comparisonChart) {
            comparisonChart.destroy();
        }
        comparisonChart = new Chart(comparisonChartCanvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Loan Balance',
                        data: data.loanData,
                        borderColor: '#9a85e1',
                        backgroundColor: 'rgba(154, 133, 225, 0.1)',
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: 'Investment Value',
                        data: data.investmentData,
                        borderColor: '#1B9272',
                        backgroundColor: 'rgba(27, 146, 114, 0.1)',
                        fill: true,
                        tension: 0.3,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { ticks: { callback: function(value) { return `₹${(value / 100000).toFixed(0)}L`; } } }
                }
            }
        });
    }

    // --- 5. INITIALIZATION ---
    function initializeApp() {
        ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay', 'loanTenureDisplay', 'investmentTenureDisplay'].forEach(id => {
            syncAndStyle(document.getElementById(id), document.getElementById(id.replace('Display', '') + 'Slider'));
        });
        goalButtons.forEach(button => { button.addEventListener('click', () => handleGoalSelection(button)); });
        finalResultsSection.classList.add('hidden');
        handleGoalSelection(document.querySelector('.goal-button.selected'));
    }

    initializeApp();
});
