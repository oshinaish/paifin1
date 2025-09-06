/**
 * PaiFinance - Interactive Script
 * Version: 21.0 - Min Time to Repay Logic & Display Fix
 * Last updated: September 7, 2025
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
    const planningHorizonContainer = document.getElementById('planningHorizonContainer');
    const planningHorizonInput = document.getElementById('planningHorizonDisplay');
    const planningHorizonSlider = document.getElementById('planningHorizonSlider');
    const prepaymentRow = document.getElementById('prepaymentRow');
    const prepaymentResult = document.getElementById('prepaymentResult');
    const investmentSubtitle = document.getElementById('investmentSubtitle');
    const emiResultElement = document.getElementById('emiResult');
    const monthlyInvestmentResult = document.getElementById('monthlyInvestmentResult');
    const emiLabel = document.getElementById('emiLabel');
    const monthlyInvestmentContainer = document.getElementById('monthlyInvestmentContainer');
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
        if (monthlyLoanRate > 0 && budget > 0) {
             acceleratedTenureMonths = -Math.log(1 - (principal * monthlyLoanRate) / budget) / Math.log(1 + monthlyLoanRate);
        } else if (budget > 0) {
            acceleratedTenureMonths = principal / budget;
        }
        
        const acceleratedTenureYears = acceleratedTenureMonths / 12;

        // **BUG FIX 1: Update the tenure slider to freeze at the correct value**
        const tenureValue = Math.ceil(acceleratedTenureYears);
        loanTenureInput.value = tenureValue;
        loanTenureSlider.value = tenureValue;
        updateSliderProgress(loanTenureSlider, tenureValue);

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

        emiResultElement.textContent = `₹ ${minEmi.toLocaleString('en-IN')}`;
        prepaymentResult.textContent = `₹ ${(budget - minEmi).toLocaleString('en-IN')}`;
        monthlyInvestmentResult.textContent = `₹ ${budget.toLocaleString('en-IN')}`;

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
        const displayTenure = tenureString || `${Math.round(scenario.tenure)} Years`;
        
        if(title !== 'Fastest Debt Freedom'){
            emiResultElement.textContent = `₹ ${scenario.emi.toLocaleString('en-IN')}`;
            monthlyInvestmentResult.textContent = `₹ ${scenario.monthlyInvestment.toLocaleString('en-IN')}`;
        }
        
        if (title === 'Fastest Debt Freedom') {
            updatePieChart(scenario.monthlyInvestment, 0);
        } else {
            updatePieChart(scenario.emi, scenario.monthlyInvestment);
        }
        
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
        const totalInvested = (title === 'Fastest Debt Freedom') ? (scenario.monthlyInvestment * Math.round(investmentTenureForCalc * 12)) : (scenario.monthlyInvestment * Math.round(scenario.tenure * 12));
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
        
        // **BUG FIX 2 & 3: Pass title to generate correct data and explanation**
        const chartData = generateComparisonData(scenario, title);
        renderComparisonChart(chartData);

        let crossoverYearText = '';
        let mainExplanation = '';

        if (title === 'Fastest Debt Freedom') {
            mainExplanation = `This chart shows your 'Fastest Repayment' strategy. First, your entire budget attacks the <strong>Loan Balance</strong>, driving it to zero in just <strong>${displayTenure}</strong>. Only after that does your <strong>Investment Value</strong> begin to grow, reaching <strong>₹${scenario.futureValue.toLocaleString('en-IN')}</strong> by the end of your planning horizon.`;
        } else {
            crossoverYearText = chartData.crossoverYear ? `The key moment is in <strong>Year ${chartData.crossoverYear}</strong>, where your investment value is projected to surpass your outstanding loan balance.` : '';
            mainExplanation = `This chart visualizes your financial journey. At the end of the term, your loan is paid off, and your investment is projected to grow to <strong>₹${scenario.futureValue.toLocaleString('en-IN')}</strong>.`;
        }

        chartExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">${title}</h4>
            <p>${mainExplanation}</p>
            <p class="mt-2">${crossoverYearText}</p>
        `;

        const amortizationData = generateAmortizationSchedule(scenario, title);
        renderAmortizationTable(amortizationData);
        amortizationExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">Loan Amortization Schedule</h4>
            <p>This table shows how your loan payments are broken down over time, separating principal from interest and showing the decreasing balance each year.</p>
        `;

        if (title !== 'Your Strategy Visualised' && title !== 'Fastest Debt Freedom') {
            paiVsTraditionalContainer.classList.remove('hidden');
            const paiVsTraditionalData = generatePaiVsTraditionalData(scenario);
            renderPaiVsTraditionalChart(paiVsTraditionalData);
            paiVsTraditionalExplanation.innerHTML = `
                <h4 class="text-lg font-bold text-textdark mb-2 pt-4">PaiFinance vs. Traditional Loans</h4>
                <p>This chart compares the PaiFinance strategy of investing alongside your loan vs. a traditional approach. Your net wealth with PaiFinance ends at <strong class="text-investment_green">₹${Math.round(scenario.netWealth).toLocaleString('en-IN')}</strong>.</p>
            `;
        } else {
            paiVsTraditionalContainer.classList.add('hidden');
        }
        
        updateSummaryBox(scenario, title, displayTenure, chartData.crossoverYear);
    }

    function createResultCard(title, scenario, color, totalInvested, totalPaidOrGains) { /* ... same as before ... */ }
    function createWidgetCard(title, scenario, color, displayTenure, totalInvested, totalGains) { /* ... same as before ... */ }
    function renderWidgetCharts(scenario, totalInvested, totalGains) { /* ... same as before ... */ }
    function updatePieChart(emi, investment) { /* ... same as before ... */ }
    function syncAndStyle(inputElement, sliderElement) { /* ... same as before ... */ }
    function updateSliderProgress(slider, value) { /* ... same as before ... */ }

    function handleGoalSelection(selectedButton) {
        goalButtons.forEach(button => button.classList.remove('selected'));
        selectedButton.classList.add('selected');
        const goal = selectedButton.dataset.goal;

        emiLabel.textContent = 'Monthly EMI';
        monthlyInvestmentContainer.classList.remove('hidden');
        investmentTenureContainer.classList.remove('hidden');
        planningHorizonContainer.classList.add('hidden');
        prepaymentRow.classList.add('hidden');
        investmentSubtitle.classList.add('hidden');
        loanTenureContainer.style.opacity = '1';
        loanTenureInput.disabled = false;
        loanTenureSlider.disabled = false;
        
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
        setTimeout(() => {
            const selectedGoal = document.querySelector('.goal-button.selected').dataset.goal;
            if (selectedGoal === 'planner') { runPlannerMode(); } 
            else if (selectedGoal === 'min-time') { findMinimumTime(); } 
            else if (selectedGoal === 'optimal-strategy') { findOptimalStrategy(); } 
            else if (selectedGoal === 'min-time-repay') { calculateFastestRepayment(); }
        }, 250);
    }
    
    // **BUG FIX 2: Updated comparison data generation**
    function generateComparisonData(scenario, title) {
        const planningHorizonYears = parseFloat(planningHorizonInput.value);
        const labels = [];
        const loanData = [];
        const investmentData = [];
        let remainingLoan = scenario.principal;
        let investmentValue = 0;
        const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
        const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;
        
        const totalYears = (title === 'Fastest Debt Freedom') ? planningHorizonYears : Math.ceil(scenario.tenure);

        for (let year = 0; year <= totalYears; year++) {
            labels.push(`Yr ${year}`);
            loanData.push(remainingLoan > 0 ? remainingLoan : 0);
            
            let yearEndInvestmentValue = investmentValue;
            
            if (title === 'Fastest Debt Freedom') {
                if (year >= scenario.tenure) { // If loan is paid off
                    for (let month = 1; month <= 12; month++) {
                        yearEndInvestmentValue = (yearEndInvestmentValue + scenario.monthlyInvestment) * (1 + monthlyInvestmentRate);
                    }
                }
            } else {
                 for (let month = 1; month <= 12; month++) {
                    yearEndInvestmentValue = (yearEndInvestmentValue + scenario.monthlyInvestment) * (1 + monthlyInvestmentRate);
                }
            }
            investmentData.push(investmentValue);
            investmentValue = yearEndInvestmentValue;

            for (let month = 1; month <= 12; month++) {
                if (remainingLoan > 0) {
                    const payment = (title === 'Fastest Debt Freedom') ? scenario.monthlyInvestment : scenario.emi;
                    const interest = remainingLoan * monthlyLoanRate;
                    const principalPaid = payment - interest;
                    remainingLoan -= principalPaid;
                }
            }
        }
        return { labels, loanData, investmentData, crossoverYear: null }; // Crossover year is complex and only for Pai strategy
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
    
    function generatePaiVsTraditionalData(scenario) {
        const labels = [];
        const paiData = [];
        const traditionalData = [];
        let investmentValue = 0;
        let cumulativeInterest = 0;
        const monthlyInvestmentRate = scenario.investmentAnnualRate / 100 / 12;
        const monthlyLoanRate = scenario.loanAnnualRate / 100 / 12;
        let remainingLoan = scenario.principal;

        for (let year = 0; year <= Math.ceil(scenario.tenure); year++) {
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
                investmentValue = (investmentValue + scenario.monthlyInvestment) * (1 + monthlyInvestmentRate);
            }
        }
        return { labels, paiData, traditionalData };
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
        summaryHTML = `<h4 class="text-sm font-bold text-center mb-2">Result Summary</h4><p class="text-xs text-center">Net Wealth after ${displayTenure}: <strong class="text-investment_green">₹${Math.round(scenario.netWealth).toLocaleString('en-IN')}</strong></p>`;
    } else if (title === 'The Race to Zero Debt') {
        summaryHTML = `<h4 class="text-sm font-bold text-center mb-2">Result Summary</h4><p class="text-xs text-center">You can offset your loan interest in just <strong class="text-investment_green">${displayTenure}</strong>.</p><p class="text-xs text-center mt-1">You can become debt-free in <strong>Year ${crossoverYear}</strong>.</p>`;
    } else if (title === 'Winning the Financial Race') {
        summaryHTML = `<h4 class="text-sm font-bold text-center mb-2">Result Summary</h4><p class="text-xs text-center">This strategy gives a net wealth of <strong class="text-investment_green">₹${Math.round(scenario.netWealth).toLocaleString('en-IN')}</strong> in <strong class="text-investment_green">${displayTenure}</strong>.</p>`;
    } else if (title === 'Fastest Debt Freedom') {
        const prepayment = scenario.monthlyInvestment - scenario.emi; // In this mode, monthlyInvestment holds the full budget
        summaryHTML = `
            <h4 class="text-sm font-bold text-center mb-2">Fastest Repayment Strategy</h4>
            <p class="text-xs text-center leading-relaxed">
                By paying your minimum EMI of <strong class="text-emi_purple">₹${scenario.emi.toLocaleString('en-IN')}</strong> and making an extra prepayment of <strong class="text-emi_purple">₹${prepayment.toLocaleString('en-IN')}</strong> each month, you can be debt-free in just <strong class="text-investment_green">${displayTenure}</strong>.
                <br><br>
                After that, by investing your entire budget for the remaining time, you can build a final corpus of <strong class="text-investment_green">₹${scenario.futureValue.toLocaleString('en-IN')}</strong>.
            </p>
        `;
    }
    summaryResultsContainer.innerHTML = summaryHTML;
}

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
