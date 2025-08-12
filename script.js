/**
 * PaiFinance - Interactive Script
 * Version: 1.1 - Added Goal Selection Logic
 * Last updated: August 13, 2025, 12:58 AM IST
 * Built by the Bros.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ELEMENT SELECTION ---
    console.log("PaiFinance is initializing...");

    // Input Fields & Sliders
    const loanAmountInput = document.getElementById('loanAmount');
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const monthlyBudgetInput = document.getElementById('monthlyBudget');
    const monthlyBudgetSlider = document.getElementById('monthlyBudgetSlider');
    const loanInterestRateInput = document.getElementById('loanInterestRateDisplay');
    const loanInterestRateSlider = document.getElementById('loanInterestRateSlider');
    const investmentRateInput = document.getElementById('investmentRateDisplay');
    const investmentRateSlider = document.getElementById('riskAppetiteSlider'); // ID from original HTML

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
    const btnPlanner = document.getElementById('btnPlanner');
    const btnMinTime = document.getElementById('btnMinTime');
    const btnOptimalStrategy = document.getElementById('btnOptimalStrategy');
    const goalButtons = [btnPlanner, btnMinTime, btnOptimalStrategy];


    // --- 2. CORE FINANCIAL ENGINE ---
    
    function calculateEMI(principal, annualRate, tenureYears) {
        // ... (code from previous step, no changes here)
        const monthlyRate = (annualRate / 100) / 12;
        const tenureMonths = tenureYears * 12;
        if (monthlyRate === 0) { return tenureMonths > 0 ? principal / tenureMonths : 0; }
        if (tenureMonths === 0) { return 0; }
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return Math.round(emi);
    }
    
    // Skeletons for our main goal functions
    function findMinimumTime() { console.log("Goal Activated: Find Minimum Time"); }
    function findOptimalStrategy() { console.log("Goal Activated: Find Optimal Strategy"); }
    function runPlannerMode() { console.log("Goal Activated: Manual Planner"); }


    // --- 3. UI INTERACTIVITY FUNCTIONS ---

    function updateLiveResults() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(loanInterestRateInput.value);
        const tenureYears = parseFloat(loanTenureInput.value);
        const budget = parseFloat(monthlyBudgetInput.value);

        // Update EMI
        if (principal > 0 && annualRate > 0 && tenureYears > 0) {
            const emi = calculateEMI(principal, annualRate, tenureYears);
            emiResultElement.textContent = `₹ ${emi.toLocaleString('en-IN')}`;
            // Update Monthly Investment
            if (budget > emi) {
                monthlyInvestmentResult.textContent = `₹ ${(budget - emi).toLocaleString('en-IN')}`;
            } else {
                monthlyInvestmentResult.textContent = '₹ 0';
            }
        } else {
            emiResultElement.textContent = '₹ 0';
            monthlyInvestmentResult.textContent = `₹ ${budget.toLocaleString('en-IN')}`;
        }
    }

    function syncAndStyle(inputElement, sliderElement) {
        // ... (code from previous step, but calls updateLiveResults)
        const updateSliderProgress = () => {
            const min = parseFloat(sliderElement.min);
            const max = parseFloat(sliderElement.max);
            const value = parseFloat(sliderElement.value);
            const progress = ((value - min) / (max - min)) * 100;
            sliderElement.style.setProperty('--range-progress', `${progress}%`);
        };
        sliderElement.addEventListener('input', () => {
            inputElement.value = sliderElement.value;
            updateSliderProgress();
            updateLiveResults(); 
        });
        inputElement.addEventListener('input', () => {
            if(parseFloat(inputElement.value) >= parseFloat(sliderElement.min) && parseFloat(inputElement.value) <= parseFloat(sliderElement.max)){
                 sliderElement.value = inputElement.value;
                 updateSliderProgress();
                 updateLiveResults();
            }
        });
        updateSliderProgress();
    }
    
    // *** NEW FUNCTION FOR GOAL HANDLING ***
    function handleGoalSelection(selectedButton) {
        // Update button styles
        goalButtons.forEach(button => {
            button.classList.remove('selected');
        });
        selectedButton.classList.add('selected');

        const goal = selectedButton.dataset.goal;
        const isPlannerMode = goal === 'planner';

        // Enable or Disable Tenure fields
        const tenureFields = [loanTenureInput, loanTenureSlider, investmentTenureInput, investmentTenureSlider];
        tenureFields.forEach(field => {
            field.disabled = !isPlannerMode;
        });

        loanTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        investmentTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        
        // Trigger the appropriate calculation function
        if(goal === 'planner') runPlannerMode();
        if(goal === 'min-time') findMinimumTime();
        if(goal === 'optimal-strategy') findOptimalStrategy();
    }


    // --- 4. INITIALIZATION & EVENT LISTENERS ---
    
    // Link all the input/slider pairs
    syncAndStyle(loanAmountInput, loanAmountSlider);
    syncAndStyle(monthlyBudgetInput, monthlyBudgetSlider);
    syncAndStyle(loanInterestRateInput, loanInterestRateSlider);
    syncAndStyle(investmentRateInput, investmentRateSlider);
    syncAndStyle(loanTenureInput, loanTenureSlider);
    syncAndStyle(investmentTenureInput, investmentTenureSlider);

    // Attach click listeners to our main goal buttons
    goalButtons.forEach(button => {
        button.addEventListener('click', () => handleGoalSelection(button));
    });

    // Perform an initial calculation and set the initial state
    updateLiveResults();
    handleGoalSelection(btnPlanner); // Set Planner as the default selected mode

    console.log("PaiFinance is fully initialized and ready.");
});
