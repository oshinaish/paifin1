/**
 * PaiFinance - Interactive Script
 * Version: 1.7 - Final Layout Logic
 * Last updated: August 13, 2025, 2:35 AM IST
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
    const investmentRateSlider = document.getElementById('riskAppetiteSlider');
    const loanTenureContainer = document.getElementById('loanTenureContainer');
    const loanTenureInput = document.getElementById('loanTenureDisplay');
    const loanTenureSlider = document.getElementById('loanTenureSlider');
    const investmentTenureContainer = document.getElementById('investmentTenureContainer');
    const investmentTenureInput = document.getElementById('investmentTenureDisplay');
    const investmentTenureSlider = document.getElementById('investmentTenureSlider');
    const emiResultElement = document.getElementById('emiResult');
    const monthlyInvestmentResult = document.getElementById('monthlyInvestmentResult');
    
    // New Result Containers
    const finalResultsSection = document.getElementById('finalResultsSection');
    const mainResultsContainer = document.getElementById('mainResultsContainer');

    const chartsContainer = document.getElementById('chartsContainer');
    const goalButtons = document.querySelectorAll('.goal-button');
    const chartCanvas = document.getElementById('monthlyBudgetChart');
    const chartMessage = document.getElementById('chartMessage');
    let monthlyBudgetChart = null;

    // --- 2. CORE FINANCIAL ENGINE ---
    function calculateEMI(principal, annualRate, tenureYears) {
        const monthlyRate = (annualRate / 100) / 12;
        const tenureMonths = tenureYears * 12;
        if (monthlyRate === 0) { return tenureMonths > 0 ? principal / tenureMonths : 0; }
        if (tenureMonths <= 0) { return principal; }
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return Math.round(emi);
    }

    function calculateFutureValue(monthlyInvestment, annualRate, tenureYears) {
        const monthlyRate = (annualRate / 100) / 12;
        const tenureMonths = tenureYears * 12;
        if (monthlyRate === 0) { return monthlyInvestment * tenureMonths; }
        const fv = monthlyInvestment * ( (Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate );
        return Math.round(fv);
    }

    // --- 3. GOAL-BASED CALCULATION STRATEGIES ---
    function runPlannerMode() {
        finalResultsSection.classList.add('hidden'); // Hide bottom results
        chartsContainer.classList.remove('hidden'); // Show pie chart
        updateLiveResults();
    }

    function findOptimalStrategy() {
        chartsContainer.classList.add('hidden');
        finalResultsSection.classList.remove('hidden');
        mainResultsContainer.innerHTML = `<div class="text-center p-4">Calculating your optimal strategy...</div>`;
        
        setTimeout(() => {
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
                    bestScenario = { tenure, emi, monthlyInvestment, totalInterestPaid, futureValue, netWealth };
                }
            }

            if (bestScenario) {
                displayOptimalResults(bestScenario);
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found. Try increasing your budget.</div>`;
            }
        }, 100);
    }

    function findMinimumTime() {
        finalResultsSection.classList.remove('hidden');
        mainResultsContainer.innerHTML = `<div class="text-center p-4">The "Minimum Time" feature is the next one we'll build! Coming soon.</div>`;
        chartsContainer.classList.add('hidden');
    }

    // --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---
    function updateLiveResults() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(loanInterestRateInput.value);
        const tenureYears = parseFloat(loanTenureInput.value);
        const budget = parseFloat(monthlyBudgetInput.value);
        if (principal > 0 && annualRate > 0 && tenureYears > 0) {
            const emi = calculateEMI(principal, annualRate, tenureYears);
            emiResultElement.textContent = `₹ ${emi.toLocaleString('en-IN')}`;
            if (budget >= emi) {
                const investment = budget - emi;
                monthlyInvestmentResult.textContent = `₹ ${investment.toLocaleString('en-IN')}`;
                updatePieChart(emi, investment);
            } else {
                monthlyInvestmentResult.textContent = 'Budget too low';
                updatePieChart(budget, 0);
            }
        } else {
            emiResultElement.textContent = '₹ 0';
            monthlyInvestmentResult.textContent = `₹ ${budget.toLocaleString('en-IN')}`;
            updatePieChart(0, budget);
        }
    }

    function displayOptimalResults(scenario) {
        // Update sliders to show the optimal tenure
        loanTenureInput.value = scenario.tenure;
        investmentTenureInput.value = scenario.tenure;
        // Trigger a 'change' event to update the slider's visual state
        loanTenureInput.dispatchEvent(new Event('input'));
        investmentTenureInput.dispatchEvent(new Event('input'));

        // Build the HTML for the 4 result widgets
        mainResultsContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-textdark font-albert_sans mb-4 text-center">Your Optimal Strategy Results</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${createResultCard('Loan Details', `Optimal Tenure: ${scenario.tenure} Years<br>Monthly EMI: ₹${scenario.emi.toLocaleString('en-IN')}`, 'primary')}
                ${createResultCard('Investment Details', `Monthly SIP: ₹${scenario.monthlyInvestment.toLocaleString('en-IN')}<br>Total Wealth Built: ₹${scenario.futureValue.toLocaleString('en-IN')}`, 'success')}
                ${createResultCard('Net Money Input', `Total Paid: ₹${(scenario.emi * scenario.tenure * 12).toLocaleString('en-IN')}`, 'warning')}
                ${createResultCard('Net Money Output', `Net Wealth Created: ₹${scenario.netWealth.toLocaleString('en-IN')}`, 'success')}
            </div>
        `;
    }

    function createResultCard(title, content, color) {
        const colorClasses = {
            primary: 'border-t-primary',
            success: 'border-t-success',
            warning: 'border-t-danger'
        };
        return `
            <div class="bg-card p-4 rounded-lg shadow-default border-t-4 ${colorClasses[color]}">
                <h3 class="text-md font-bold text-textdark mb-2">${title}</h3>
                <p class="text-textlight leading-relaxed">${content}</p>
            </div>
        `;
    }

    function updatePieChart(emi, investment) {
        chartMessage.style.display = 'none';
        const data = { labels: ['EMI', 'Investment'], datasets: [{ data: [emi, investment], backgroundColor: ['#4F46E5', '#22C55E'], borderColor: '#F9FAFB', borderWidth: 2 }] };
        if (monthlyBudgetChart) {
            monthlyBudgetChart.data = data;
            monthlyBudgetChart.update();
        } else {
            monthlyBudgetChart = new Chart(chartCanvas, { type: 'doughnut', data: data, options: { responsive: true, maintainAspectRatio: true, cutout: '60%', plugins: { legend: { display: true, position: 'bottom' } } } });
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
            if (document.querySelector('.goal-button.selected').dataset.goal === 'planner') {
                updateLiveResults();
            }
        };
        sliderElement.addEventListener('input', () => { inputElement.value = sliderElement.value; updateSliderProgress(); handleInput(); });
        inputElement.addEventListener('input', () => {
            if (parseFloat(inputElement.value) >= parseFloat(sliderElement.min) && parseFloat(inputElement.value) <= parseFloat(sliderElement.max)) {
                sliderElement.value = sliderElement.value;
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

    // --- 5. INITIALIZATION ---
    ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay', 'loanTenureDisplay', 'investmentTenureDisplay'].forEach(id => {
        syncAndStyle(document.getElementById(id), document.getElementById(id.replace('Display', '') + 'Slider'));
    });
    goalButtons.forEach(button => { button.addEventListener('click', () => handleGoalSelection(button)); });
    handleGoalSelection(document.querySelector('.goal-button.selected'));
    updateLiveResults();
    console.log("PaiFinance initialization complete.");
});
