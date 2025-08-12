/**
 * PaiFinance - Interactive Script
 * Version: 1.0
 * Last updated: August 13, 2025, 12:28 AM IST
 * Built by the Bros.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ELEMENT SELECTION ---
    // Grabbing all the HTML elements we need to work with.
    console.log("PaiFinance is initializing...");

    // Input Fields
    const loanAmountInput = document.getElementById('loanAmount');
    const monthlyBudgetInput = document.getElementById('monthlyBudget');
    const loanInterestRateInput = document.getElementById('loanInterestRateDisplay');
    const loanTenureInput = document.getElementById('loanTenureDisplay');
    const investmentRateInput = document.getElementById('riskAppetiteDisplay');

    // Sliders
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const monthlyBudgetSlider = document.getElementById('monthlyBudgetSlider');
    const loanInterestRateSlider = document.getElementById('loanInterestRateSlider');
    const loanTenureSlider = document.getElementById('loanTenureSlider');
    const investmentRateSlider = document.getElementById('riskAppetiteSlider');
    
    // Result Displays
    const emiResultElement = document.getElementById('emiResult');

    // Buttons
    const btnMinTime = document.getElementById('btnMinTime');
    const btnOptimalStrategy = document.getElementById('btnOptimalStrategy');


    // --- 2. CORE FINANCIAL ENGINE ---
    // This section contains the pure math functions. The "brain" of the tool.

    function calculateEMI(principal, annualRate, tenureYears) {
        const monthlyRate = (annualRate / 100) / 12;
        const tenureMonths = tenureYears * 12;

        if (monthlyRate === 0) {
            return tenureMonths > 0 ? principal / tenureMonths : 0;
        }
        
        if (tenureMonths === 0) {
            return 0;
        }

        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return Math.round(emi);
    }

    // --- Skeletons for our main goal functions (to be built next) ---
    
    function findMinimumTime() {
        console.log("Goal Activated: Find Minimum Time to Offset Interest");
        // Logic will go here...
    }

    function findOptimalStrategy() {
        console.log("Goal Activated: Find Optimal Strategy for Max Wealth");
        // Logic will go here...
    }


    // --- 3. UI INTERACTIVITY FUNCTIONS ---
    // These functions connect the engine to the UI and make the page feel alive.

    function updateLiveEMI() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(loanInterestRateInput.value);
        const tenureYears = parseFloat(loanTenureInput.value);

        if (principal > 0 && annualRate > 0 && tenureYears > 0) {
            const emi = calculateEMI(principal, annualRate, tenureYears);
            emiResultElement.textContent = `₹ ${emi.toLocaleString('en-IN')}`;
        } else {
            emiResultElement.textContent = '₹ 0';
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

        sliderElement.addEventListener('input', () => {
            inputElement.value = sliderElement.value;
            updateSliderProgress();
            updateLiveEMI(); 
        });

        inputElement.addEventListener('input', () => {
            // Basic validation to prevent empty or invalid values breaking the slider
            if(parseFloat(inputElement.value) >= parseFloat(sliderElement.min) && parseFloat(inputElement.value) <= parseFloat(sliderElement.max)){
                 sliderElement.value = inputElement.value;
                 updateSliderProgress();
                 updateLiveEMI();
            }
        });

        updateSliderProgress();
    }


    // --- 4. INITIALIZATION & EVENT LISTENERS ---
    // This is where we kick everything off when the page loads.

    // Link all the input/slider pairs
    syncAndStyle(loanAmountInput, loanAmountSlider);
    syncAndStyle(monthlyBudgetInput, monthlyBudgetSlider);
    syncAndStyle(loanInterestRateInput, loanInterestRateSlider);
    syncAndStyle(loanTenureInput, loanTenureSlider);
    syncAndStyle(investmentRateInput, investmentRateSlider);

    // Attach click listeners to our main goal buttons
    btnMinTime.addEventListener('click', findMinimumTime);
    btnOptimalStrategy.addEventListener('click', findOptimalStrategy);

    // Perform an initial EMI calculation on page load with default values
    updateLiveEMI();

    console.log("PaiFinance is fully initialized and ready.");
});
