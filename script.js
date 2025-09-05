/**
 * PaiFinance - Interactive Script
 * Version: 15.0 - FINAL SUMMARY BOX FIX
 * Last updated: August 22, 2025, 12:30 AM IST
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
    const planningHorizonInput = document.getElementById('planningHorizonDisplay');
    const planningHorizonSlider = document.getElementById('planningHorizonSlider');
    const prepaymentRow = document.getElementById('prepaymentRow');
    const prepaymentResult = document.getElementById('prepaymentResult');
    const investmentSubtitle = document.getElementById('investmentSubtitle');
    const investmentTenureContainer = document.getElementById('investmentTenureContainer'); 
    
    


    
    // Result Containers
    
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
    
    // --- 2. CORE FINANCIAL ENGINE (Sealed and Final) ---
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
             mainResultsContainer.innerHTML = `<div class="text-center p-4 text-warning">Loan cannot be repaid within your ${planningHorizonYears}-year planning horizon. It will take approx. ${Math.round(acceleratedTenureYears)} years.</div>`;
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
        clearTimeout(calculationTimeout);
        calculationTimeout = setTimeout(() => {
            const selectedGoal = document.querySelector('.goal-button.selected').dataset.goal;
            if (selectedGoal === 'planner') {
                runPlannerMode();
            } else if (selectedGoal === 'min-time') {
                findMinimumTime();
            } else if (selectedGoal === 'optimal-strategy') {
                findOptimalStrategy();
            } else if (selectedGoal === 'min-time-repay') {
                calculateFastestRepayment();
            }
        }, 250); // A small delay to prevent calculations on every tiny slider move
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
         // Default UI state
        loanTenureContainer.style.opacity = '1';
        loanTenureInput.disabled = false;
        loanTenureSlider.disabled = false;
        investmentTenureContainer.style.opacity = '1';
        investmentTenureInput.disabled = false;
        investmentTenureSlider.disabled = false;
        prepaymentRow.classList.add('hidden');
        prepaymentRow.classList.remove('flex');
        investmentSubtitle.classList.add('hidden');
        
        // Apply changes based on selected goal
        if (goal === 'min-time-repay') {
            prepaymentRow.classList.remove('hidden');
            prepaymentRow.classList.add('flex');
            investmentSubtitle.classList.remove('hidden');
            loanTenureContainer.style.opacity = '0.5';
            loanTenureInput.disabled = true;
            loanTenureSlider.disabled = true;
            investmentTenureContainer.style.opacity = '0.5';
            investmentTenureInput.disabled = true;
            investmentTenureSlider.disabled = true;
        } else if (goal !== 'planner') {
            loanTenureContainer.style.opacity = '0.5';
            loanTenureInput.disabled = true;
            loanTenureSlider.disabled = true;
            investmentTenureContainer.style.opacity = '1';
            investmentTenureInput.disabled = false;
            investmentTenureSlider.disabled = false;
        }
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
            const traditionalNetWealth = -scenario.totalInterestPaid;
            const advantage = scenario.netWealth - traditionalNetWealth;
            summaryHTML = `
                <h4 class="text-sm font-bold text-center mb-2">Result Summary</h4>
                <p class="text-xs text-center">By using the PaiFinance strategy, you can generate a net wealth of <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong>, as opposed to a net negative of <strong class="text-danger">-₹${scenario.totalInterestPaid.toLocaleString('en-IN')}</strong> with a traditional loan.</p>
            `;
        }
        summaryResultsContainer.innerHTML = summaryHTML;
    }
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
        const idsToSync = ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay', 'loanTenureDisplay', 'planningHorizonDisplay', 'investmentTenureDisplay'];
        idsToSync.forEach(id => {
            if (document.getElementById(id)) {
                syncAndStyle(document.getElementById(id), document.getElementById(id.replace('Display', '') + 'Slider'));
            }
        });
        
        goalButtons.forEach(button => { button.addEventListener('click', () => handleGoalSelection(button)); });
        finalResultsSection.classList.add('hidden');
        handleGoalSelection(document.querySelector('.goal-button.selected'));
    }

    initializeApp();
});
