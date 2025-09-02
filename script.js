/**
 * PaiFinance - Interactive Script
 * Version: 17.0 - REALISTIC TRADITIONAL WEALTH (Separated Logic)
 * Last updated: September 4, 2025, 12:45 AM IST
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
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found.</div>`;
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
                const years = Math.floor(foundScenario.tenure);
                const remainingMonths = Math.round((foundScenario.tenure - years) * 12);
                const tenureString = `${years} Years, ${remainingMonths} Months`;
                displayResults(foundScenario, 'The Race to Zero Debt', tenureString);
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

        if (title !== 'Your Strategy Visualised') {
            const fullBudget = parseFloat(monthlyBudgetInput.value);
            const paiVsTraditionalData = generatePaiVsTraditionalData(scenario, fullBudget);
            renderPaiVsTraditionalChart(paiVsTraditionalData);

            const traditionalResultText = `₹${Math.round(paiVsTraditionalData.finalTraditionalNetWealth).toLocaleString('en-IN')}`;
            const traditionalResultColor = paiVsTraditionalData.finalTraditionalNetWealth >= 0 ? 'text-investment_green' : 'text-danger';

            paiVsTraditionalExplanation.innerHTML = `
                <h4 class="text-lg font-bold text-textdark mb-2 pt-4">PaiFinance vs. Smart Traditional</h4>
                <p>This chart compares two strategies using the same monthly budget.</p>
                <p class="mt-2">The <span class="font-semibold text-danger">red line</span> shows a smart traditional strategy: using your entire budget to pay off the loan first, then investing for the remaining years. This results in a final net wealth of <strong class="font-bold ${traditionalResultColor}">${traditionalResultText}</strong>.</p>
                <p class="mt-2">The <span class="font-semibold text-investment_green">green line</span> shows the PaiFinance strategy of paying the loan and investing simultaneously. This results in a final net wealth of <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong>.</p>
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
                        <tr><td class="text-left py-1">Total EMIs</td><td class="text-right font-semibold">₹${totalPaid.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left py-1">Total Investments</td><td class="text-right font-semibold">₹${totalInvested.toLocaleString('en-IN')}</td></tr>
                        <tr class="bg-gray-100 rounded"><td class="text-left font-bold p-1">Total Outflow</td><td class="text-right font-bold p-1">₹${(totalPaid + totalInvested).toLocaleString('en-IN')}</td></tr>
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
                        <tr><td class="flex items-center py-1"><span class="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>Interest</td><td class="text-right font-semibold text-emi_purple">₹${scenario.totalInterestPaid.toLocaleString('en-IN')}</td></tr>
                        <tr><td class="text-left font-bold py-1">Total Paid</td><td class="text-right font-bold text-textdark">₹${(scenario.principal + scenario.totalInterestPaid).toLocaleString('en-IN')}</td></tr>
                    </tbody>
                </table>
            `;
            canvasId = 'loanWidgetChart';
            percentage = (scenario.principal + scenario.totalInterestPaid) > 0 ? Math.round((scenario.totalInterestPaid / (scenario.principal + scenario.totalInterestPaid)) * 100) : 0;
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
        const total = emi + investment;
        if (total === 0) {
            chartMessage.style.display = 'flex';
            if(monthlyBudgetChart) monthlyBudgetChart.destroy();
            monthlyBudgetChart = null;
            return;
        }

        chartMessage.style.display = 'none';
        const data = { 
            labels: ['EMI', 'Investment'], 
            datasets: [{ 
                data: [emi, investment], 
                backgroundColor: ['rgba(154, 133, 225, 0.75)', 'rgba(27, 146, 114, 0.75)'], 
                borderColor: '#F9FAFB', 
                borderWidth: 2 
            }] 
        };
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
        
        sliderElement.addEventListener('input', () => { 
            inputElement.value = sliderElement.value; 
            updateSlider(); 
            triggerCalculation();
        });
        inputElement.addEventListener('input', () => {
            if (parseFloat(inputElement.value) >= parseFloat(sliderElement.min) && parseFloat(inputElement.value) <= parseFloat(sliderElement.max)) {
                sliderElement.value = inputElement.value;
                updateSlider();
                triggerCalculation();
            }
        });
        updateSlider();
    }
    
    function triggerCalculation() {
        const selectedGoal = document.querySelector('.goal-button.selected').dataset.goal;
        if (selectedGoal === 'planner') {
            runPlannerMode();
        } else if (selectedGoal === 'min-time') {
            findMinimumTime();
        } else if (selectedGoal === 'optimal-strategy') {
            findOptimalStrategy();
        }
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
        const isPlannerMode = goal === 'planner';
        [loanTenureInput, loanTenureSlider, investmentTenureInput, investmentTenureSlider].forEach(field => { field.disabled = !isPlannerMode; });
        loanTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        investmentTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        
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
        for (let year = 0; year <= Math.ceil(scenario.tenure); year++) {
            labels.push(`Yr ${year}`);
            loanData.push(remainingLoan > 0 ? remainingLoan : 0);
            investmentData.push(investmentValue);

            if (investmentValue > remainingLoan && crossoverYear === null) {
                crossoverYear = year;
            }

            for (let month = 1; month <= 12; month++) {
                if (remainingLoan > 0) {
                    const interest = remainingLoan * monthlyLoanRate;
                    const principalPaid = scenario.emi - interest;
                    remainingLoan -= principalPaid;
                }
                investmentValue = (investmentValue + scenario.monthlyInvestment) * (1 + monthlyInvestmentRate);
            }
        }
        return { labels, loanData, investmentData, crossoverYear };
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
                    const principalPaid = scenario.emi - interest;
                    yearlyInterest += interest;
                    yearlyPrincipal += principalPaid;
                    remainingLoan -= principalPaid;
                }
            }
            schedule.push({
                year,
                principal: Math.round(yearlyPrincipal),
                interest: Math.round(yearlyInterest),
                balance: Math.round(remainingLoan > 0 ? remainingLoan : 0)
            });
        }
        return schedule;
    }

    function renderAmortizationTable(data) {
        let tableHTML = `
            <table class="w-full text-sm text-left">
                <thead class="text-xs text-textdark uppercase bg-gray-50 sticky top-0">
                    <tr>
                        <th scope="col" class="px-6 py-3">Year</th>
                        <th scope="col" class="px-6 py-3">Principal Paid</th>
                        <th scope="col" class="px-6 py-3">Interest Paid</th>
                        <th scope="col" class="px-6 py-3">Ending Balance</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(row => {
            tableHTML += `
                <tr class="bg-white border-b">
                    <td class="px-6 py-4 font-semibold">${row.year}</td>
                    <td class="px-6 py-4 font-semibold">₹${row.principal.toLocaleString('en-IN')}</td>
                    <td class="px-6 py-4 font-semibold">₹${row.interest.toLocaleString('en-IN')}</td>
                    <td class="px-6 py-4 font-semibold">₹${row.balance.toLocaleString('en-IN')}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;
        amortizationTableContainer.innerHTML = tableHTML;
    }
    
    /**
     * NEW REALISTIC TRADITIONAL WEALTH CALCULATION
     * This function calculates two scenarios:
     * 1. Pai Strategy: Simultaneous loan payment and investment.
     * 2. Traditional Strategy: Pay off loan first with the entire budget, then invest the budget for the remaining tenure.
     */
    function generatePaiVsTraditionalData(scenario, fullBudget) {
        const totalMonths = Math.ceil((scenario.investmentTenure || scenario.tenure) * 12);
        const labels = Array.from({ length: Math.ceil(totalMonths / 12) + 1 }, (_, i) => `Yr ${i}`);
        
        const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
        const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;

        // --- PAI STRATEGY (SIMULTANEOUS) ---
        const paiData = [0];
        let paiInvestmentValue = 0;
        let paiCumulativeInterest = 0;
        let paiRemainingLoan = scenario.principal;
        for (let month = 1; month <= totalMonths; month++) {
            if (paiRemainingLoan > 0) {
                const interest = paiRemainingLoan * monthlyLoanRate;
                paiCumulativeInterest += interest;
                const principalPaid = scenario.emi - interest;
                paiRemainingLoan -= principalPaid;
            }
            if (scenario.monthlyInvestment > 0) {
               paiInvestmentValue = (paiInvestmentValue + scenario.monthlyInvestment) * (1 + monthlyInvestmentRate);
            }
            if (month % 12 === 0) {
                paiData.push(paiInvestmentValue - paiCumulativeInterest);
            }
        }
         if (totalMonths % 12 !== 0) {
            paiData.push(paiInvestmentValue - paiCumulativeInterest);
        }

        // --- TRADITIONAL STRATEGY (DEBT-FIRST) ---
        const traditionalData = [0];
        let traditionalRemainingLoan = scenario.principal;
        let traditionalCumulativeInterest = 0;
        let traditionalInvestmentValue = 0;
        for (let month = 1; month <= totalMonths; month++) {
            // Phase 1: Pay off loan aggressively
            if (traditionalRemainingLoan > 0) {
                const interest = traditionalRemainingLoan * monthlyLoanRate;
                traditionalCumulativeInterest += interest;
                let principalPaid = fullBudget - interest;

                if (principalPaid < 0) principalPaid = 0; // In case budget is less than interest

                // If the payment is more than the remaining balance, pay only what's left
                if ((principalPaid + interest) > (traditionalRemainingLoan + interest) ) {
                    principalPaid = traditionalRemainingLoan;
                }
                 traditionalRemainingLoan -= principalPaid;
            }
            // Phase 2: Once loan is paid, invest the full budget
            else {
                 traditionalInvestmentValue = (traditionalInvestmentValue + fullBudget) * (1 + monthlyInvestmentRate);
            }

            if (month % 12 === 0) {
                traditionalData.push(traditionalInvestmentValue - traditionalCumulativeInterest);
            }
        }
         if (totalMonths % 12 !== 0) {
            traditionalData.push(traditionalInvestmentValue - traditionalCumulativeInterest);
        }

        const finalTraditionalNetWealth = traditionalInvestmentValue - traditionalCumulativeInterest;

        return { labels, paiData, traditionalData, finalTraditionalNetWealth };
    }


    function renderPaiVsTraditionalChart(data) {
        if (paiVsTraditionalChart) {
            paiVsTraditionalChart.destroy();
        }
        paiVsTraditionalChart = new Chart(paiVsTraditionalChartCanvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'PaiFinance Net Wealth',
                        data: data.paiData,
                        borderColor: '#1B9272',
                        backgroundColor: 'rgba(27, 146, 114, 0.1)',
                        fill: true,
                        tension: 0.3,
                    },
                    {
                        label: 'Traditional Net Wealth',
                        data: data.traditionalData,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.3,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) { return `₹${(value / 100000).toFixed(0)}L`; }
                        }
                    }
                }
            }
        });
    }

    function updateSummaryBox(scenario, title, displayTenure, crossoverYear) {
        summaryResultsContainer.classList.remove('hidden');
        let summaryHTML = '';

        if (title === 'Your Strategy Visualised') {
            summaryHTML = `
                <h4 class="text-sm font-bold text-center mb-2">Result Summary</h4>
                <p class="text-xs text-center">Net Wealth after ${displayTenure}: <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong></p>
            `;
        } else if (title === 'The Race to Zero Debt') {
            summaryHTML = `
                <h4 class="text-sm font-bold text-center mb-2">Result Summary</h4>
                <p class="text-xs text-center">You can offset your loan interest in just <strong class="text-investment_green">${displayTenure}</strong>.</p>
                <p class="text-xs text-center mt-1">You can become debt-free in <strong>Year ${crossoverYear}</strong>.</p>
            `;
        } else if (title === 'Winning the Financial Race') {
            const fullBudget = parseFloat(monthlyBudgetInput.value);
            const traditionalData = generatePaiVsTraditionalData(scenario, fullBudget);
            const traditionalNetWealth = traditionalData.finalTraditionalNetWealth;
            const advantage = scenario.netWealth - traditionalNetWealth;
            summaryHTML = `
                <h4 class="text-sm font-bold text-center mb-2">Optimal Strategy Found!</h4>
                <p class="text-xs text-center">With a tenure of <strong class="text-investment_green">${displayTenure}</strong>, your net wealth is <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong>.</p>
                 <p class="text-xs text-center mt-1">This is a <strong class="text-success">₹${advantage.toLocaleString('en-IN')}</strong> advantage over the smart traditional method.</p>
            `;
        }
        summaryResultsContainer.innerHTML = summaryHTML;
    }

    // --- 5. INITIALIZATION ---
    function initializeApp() {
        ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay', 'loanTenureDisplay', 'investmentTenureDisplay'].forEach(id => {
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

