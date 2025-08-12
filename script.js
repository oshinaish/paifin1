/**
 * PaiFinance - Interactive Script
 * Version: 1.3 - Added Full Results Display
 * Last updated: August 13, 2025, 1:25 AM IST
 * Built by the Bros.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ELEMENT SELECTION ---
    console.log("PaiFinance is initializing...");

    // Inputs & Sliders
    const loanAmountInput = document.getElementById('loanAmount');
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const monthlyBudgetInput = document.getElementById('monthlyBudget');
    const monthlyBudgetSlider = document.getElementById('monthlyBudgetSlider');
    const loanInterestRateInput = document.getElementById('loanInterestRateDisplay');
    const loanInterestRateSlider = document.getElementById('loanInterestRateSlider');
    const investmentRateInput = document.getElementById('investmentRateDisplay');
    const investmentRateSlider = document.getElementById('riskAppetiteSlider');

    // Tenure Elements
    const loanTenureContainer = document.getElementById('loanTenureContainer');
    const loanTenureInput = document.getElementById('loanTenureDisplay');
    const loanTenureSlider = document.getElementById('loanTenureSlider');
    const investmentTenureContainer = document.getElementById('investmentTenureContainer');
    const investmentTenureInput = document.getElementById('investmentTenureDisplay');
    const investmentTenureSlider = document.getElementById('investmentTenureSlider');
    
    // Result Displays
    const emiResultElement = document.getElementById('emiResult');
    const monthlyInvestmentResult = document.getElementById('monthlyInvestmentResult');
    const mainResultsContainer = document.getElementById('mainResultsContainer'); // The container for our new cards
    const chartsContainer = document.getElementById('chartsContainer'); // The container for the pie chart

    // Goal Buttons
    const goalButtons = document.querySelectorAll('.goal-button');
    
    // Chart Elements
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
        console.log("Goal Activated: Manual Planner");
        mainResultsContainer.classList.add('hidden'); // Hide detailed results
        chartsContainer.classList.remove('hidden'); // Show pie chart
        updateLiveResults();
    }

    function findOptimalStrategy() {
        console.log("Goal Activated: Find Optimal Strategy");
        chartsContainer.classList.add('hidden'); // Hide pie chart
        mainResultsContainer.classList.remove('hidden');
        mainResultsContainer.innerHTML = `<div class="text-center p-4">Calculating optimal strategy...</div>`;
        
        setTimeout(() => {
            const principal = parseFloat(loanAmountInput.value);
            const budget = parseFloat(monthlyBudgetInput.value);
            const loanAnnualRate = parseFloat(loanInterestRateInput.value);
            const investmentAnnualRate = parseFloat(investmentRateInput.value);

            let bestScenario = null;
            let maxNetWealth = -Infinity;

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
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found with the given budget. Try increasing your budget.</div>`;
            }
        }, 100);
    }
    
    function findMinimumTime() {
        console.log("Goal Activated: Find Minimum Time");
        chartsContainer.classList.add('hidden');
        mainResultsContainer.classList.remove('hidden');
        mainResultsContainer.innerHTML = `<div class="text-center p-4">The "Minimum Time" feature is the next one we'll build! Coming soon.</div>`;
    }


    // --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---

    function updateLiveResults() {
        // ... (This function remains the same)
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
    
    // *** NEW FUNCTION TO DISPLAY THE FINAL RESULTS ***
    function displayOptimalResults(scenario) {
        // Update the live results in the main box
        emiResultElement.textContent = `₹ ${scenario.emi.toLocaleString('en-IN')}`;
        monthlyInvestmentResult.textContent = `₹ ${scenario.monthlyInvestment.toLocaleString('en-IN')}`;
        loanTenureInput.value = scenario.tenure;
        loanTenureSlider.value = scenario.tenure;
        investmentTenureInput.value = scenario.tenure;
        investmentTenureSlider.value = scenario.tenure;
        syncAndStyle(loanTenureInput, loanTenureSlider);
        syncAndStyle(investmentTenureInput, investmentTenureSlider);

        // Build the HTML for the result cards
        mainResultsContainer.innerHTML = `
            <h2 class="text-xl font-bold text-textdark font-albert_sans mb-4 text-center">Your Optimal Strategy</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${createResultCard('Optimal Tenure', `${scenario.tenure} Years`, 'primary')}
                ${createResultCard('Total Wealth Built', `₹ ${scenario.futureValue.toLocaleString('en-IN')}`, 'success')}
                ${createResultCard('Total Loan Interest', `₹ ${scenario.totalInterestPaid.toLocaleString('en-IN')}`, 'warning')}
                ${createResultCard('Net Wealth Created', `₹ ${scenario.netWealth.toLocaleString('en-IN')}`, 'success', true)}
            </div>
        `;
    }

    // Helper function to create a result card
    function createResultCard(label, value, color, isLarge = false) {
        const colorClasses = {
            primary: 'text-primary',
            success: 'text-success',
            warning: 'text-danger' // Using red for interest cost
        };
        const sizeClass = isLarge ? 'md:col-span-2 text-center' : 'text-center';
        
        return `
            <div class="bg-card p-4 rounded-lg shadow-default ${sizeClass}">
                <h3 class="text-sm font-semibold text-textlight mb-1">${label}</h3>
                <p class="text-2xl font-bold ${colorClasses[color]} font-albert_sans">${value}</p>
            </div>
        `;
    }

    function updatePieChart(emi, investment) {
        // ... (This function remains the same)
        chartMessage.style.display = 'none';
        const data = {
            labels: ['EMI', 'Investment'],
            datasets: [{
                data: [emi, investment],
                backgroundColor: ['#4F46E5', '#22C55E'],
                borderColor: '#FFFFFF',
                borderWidth: 2,
            }]
        };
        if (monthlyBudgetChart) {
            monthlyBudgetChart.data = data;
            monthlyBudgetChart.update();
        } else {
            monthlyBudgetChart = new Chart(chartCanvas, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }

    function syncAndStyle(inputElement, sliderElement) {
        // ... (This function remains the same)
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
        sliderElement.addEventListener('input', () => {
            inputElement.value = sliderElement.value;
            updateSliderProgress();
            handleInput();
        });
        inputElement.addEventListener('input', () => {
            if(parseFloat(inputElement.value) >= parseFloat(sliderElement.min) && parseFloat(inputElement.value) <= parseFloat(sliderElement.max)){
                 sliderElement.value = sliderElement.value;
                 updateSliderProgress();
                 handleInput();
            }
        });
        updateSliderProgress();
    }
    
    function handleGoalSelection(selectedButton) {
        // ... (This function remains the same)
        goalButtons.forEach(button => button.classList.remove('selected'));
        selectedButton.classList.add('selected');
        const goal = selectedButton.dataset.goal;
        const isPlannerMode = goal === 'planner';
        const tenureFields = [loanTenureInput, loanTenureSlider, investmentTenureInput, investmentTenureSlider];
        tenureFields.forEach(field => field.disabled = !isPlannerMode);
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

    goalButtons.forEach(button => {
        button.addEventListener('click', () => handleGoalSelection(button));
    });

    handleGoalSelection(document.querySelector('.goal-button.selected'));
    updateLiveResults();

    console.log("PaiFinance is fully initialized and ready.");
});
