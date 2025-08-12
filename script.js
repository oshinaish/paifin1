/**
 * PaiFinance - Interactive Script
 * Version: 1.2 - Added Calculation Engine & Chart Logic
 * Last updated: August 13, 2025, 1:15 AM IST
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

    // Goal Buttons
    const goalButtons = document.querySelectorAll('.goal-button');
    
    // Chart Elements
    const chartCanvas = document.getElementById('monthlyBudgetChart');
    const chartMessage = document.getElementById('chartMessage');
    let monthlyBudgetChart = null; // To hold the chart instance


    // --- 2. CORE FINANCIAL ENGINE ---
    
    function calculateEMI(principal, annualRate, tenureYears) {
        const monthlyRate = (annualRate / 100) / 12;
        const tenureMonths = tenureYears * 12;
        if (monthlyRate === 0) { return tenureMonths > 0 ? principal / tenureMonths : 0; }
        if (tenureMonths <= 0) { return principal; } // If no tenure, EMI is the full amount
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return Math.round(emi);
    }

    function calculateFutureValue(monthlyInvestment, annualRate, tenureYears) {
        const monthlyRate = (annualRate / 100) / 12;
        const tenureMonths = tenureYears * 12;
        if (monthlyRate === 0) { return monthlyInvestment * tenureMonths; }
        // Standard SIP Future Value Formula
        const fv = monthlyInvestment * ( (Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate );
        return Math.round(fv);
    }


    // --- 3. GOAL-BASED CALCULATION STRATEGIES ---

    function runPlannerMode() {
        console.log("Goal Activated: Manual Planner");
        updateLiveResults(); // The live update function already does everything for this mode
    }

    function findOptimalStrategy() {
        console.log("Goal Activated: Find Optimal Strategy");
        chartMessage.textContent = 'Calculating optimal strategy...';
        
        // Use setTimeout to allow the UI to update before this heavy calculation starts
        setTimeout(() => {
            const principal = parseFloat(loanAmountInput.value);
            const budget = parseFloat(monthlyBudgetInput.value);
            const loanAnnualRate = parseFloat(loanInterestRateInput.value);
            const investmentAnnualRate = parseFloat(investmentRateInput.value);

            let bestScenario = null;
            let maxNetWealth = -Infinity;

            // Loop through every possible tenure from 1 to 30 years
            for (let tenure = 1; tenure <= 30; tenure++) {
                const emi = calculateEMI(principal, loanAnnualRate, tenure);

                // If EMI is more than the budget, this tenure is not possible
                if (emi > budget) {
                    continue; 
                }

                const monthlyInvestment = budget - emi;
                const totalInterestPaid = (emi * tenure * 12) - principal;
                const futureValue = calculateFutureValue(monthlyInvestment, investmentAnnualRate, tenure);
                const netWealth = futureValue - totalInterestPaid;

                if (netWealth > maxNetWealth) {
                    maxNetWealth = netWealth;
                    bestScenario = {
                        principal,
                        budget,
                        loanAnnualRate,
                        investmentAnnualRate,
                        tenure,
                        emi,
                        monthlyInvestment,
                        totalInterestPaid,
                        futureValue,
                        netWealth
                    };
                }
            }

            if (bestScenario) {
                displayResults(bestScenario);
            } else {
                chartMessage.textContent = 'No viable strategy found with the given budget.';
                if(monthlyBudgetChart) monthlyBudgetChart.destroy();
                monthlyBudgetChart = null;
            }
        }, 100); // 100ms delay
    }
    
    function findMinimumTime() {
        console.log("Goal Activated: Find Minimum Time");
        chartMessage.textContent = 'This feature is coming soon!';
        // Future logic will go here
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
                updatePieChart(budget, 0); // Show only budget, no investment
            }
        } else {
            emiResultElement.textContent = '₹ 0';
            monthlyInvestmentResult.textContent = `₹ ${budget.toLocaleString('en-IN')}`;
            updatePieChart(0, budget);
        }
    }
    
    function displayResults(scenario) {
        // This function will be expanded to show more details on the right side
        emiResultElement.textContent = `₹ ${scenario.emi.toLocaleString('en-IN')}`;
        monthlyInvestmentResult.textContent = `₹ ${scenario.monthlyInvestment.toLocaleString('en-IN')}`;
        
        // Update the tenure sliders to show the optimal result
        loanTenureInput.value = scenario.tenure;
        loanTenureSlider.value = scenario.tenure;
        investmentTenureInput.value = scenario.tenure;
        investmentTenureSlider.value = scenario.tenure;
        syncAndStyle(loanTenureInput, loanTenureSlider); // Update progress bar
        syncAndStyle(investmentTenureInput, investmentTenureSlider);

        updatePieChart(scenario.emi, scenario.monthlyInvestment);
        chartMessage.textContent = `Optimal Tenure: ${scenario.tenure} years`;
    }

    function updatePieChart(emi, investment) {
        chartMessage.style.display = 'none'; // Hide the message text
        const totalBudget = emi + investment;
        
        const data = {
            labels: ['EMI', 'Investment'],
            datasets: [{
                data: [emi, investment],
                backgroundColor: ['#4F46E5', '#22C55E'], // Primary and Success colors
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
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(context.parsed);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
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
        sliderElement.addEventListener('input', () => {
            inputElement.value = sliderElement.value;
            updateSliderProgress();
            handleInput();
        });
        inputElement.addEventListener('input', () => {
            if(parseFloat(inputElement.value) >= parseFloat(sliderElement.min) && parseFloat(inputElement.value) <= parseFloat(sliderElement.max)){
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

        const tenureFields = [loanTenureInput, loanTenureSlider, investmentTenureInput, investmentTenureSlider];
        tenureFields.forEach(field => field.disabled = !isPlannerMode);
        loanTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        investmentTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        
        if (goal === 'planner') runPlannerMode();
        else if (goal === 'min-time') findMinimumTime();
        else if (goal === 'optimal-strategy') findOptimalStrategy();
    }


    // --- 5. INITIALIZATION ---
    
    // Link all input/slider pairs
    ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay', 'loanTenureDisplay', 'investmentTenureDisplay'].forEach(id => {
        syncAndStyle(document.getElementById(id), document.getElementById(id.replace('Display', '') + 'Slider'));
    });

    // Attach click listeners to goal buttons
    goalButtons.forEach(button => {
        button.addEventListener('click', () => handleGoalSelection(button));
    });

    // Set initial state on page load
    handleGoalSelection(document.querySelector('.goal-button.selected'));
    updateLiveResults();

    console.log("PaiFinance is fully initialized and ready.");
});
