/**
 * PaiFinance - Interactive Script
 * Version: 1.4 - DEBUGGING VERSION
 * Last updated: August 13, 2025, 2:18 AM IST
 * Built by the Bros.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. DEBUG: SCRIPT STARTED ---
    console.log("DEBUG: DOMContentLoaded event fired. Script is starting.");

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
    const mainResultsContainer = document.getElementById('mainResultsContainer');
    const chartsContainer = document.getElementById('chartsContainer');
    const goalButtons = document.querySelectorAll('.goal-button');
    const chartCanvas = document.getElementById('monthlyBudgetChart');
    const chartMessage = document.getElementById('chartMessage');
    let monthlyBudgetChart = null;

    console.log("DEBUG: All HTML elements selected.");

    // --- 2. CORE FINANCIAL ENGINE ---
    function calculateEMI(p, r, t) { /* ... same as before ... */ return Math.round(p*r/1200*Math.pow(1+r/1200,t*12)/(Math.pow(1+r/1200,t*12)-1));}
    function calculateFutureValue(p, r, t) { /* ... same as before ... */ return Math.round(p*((Math.pow(1+r/1200,t*12)-1)/(r/1200)));}

    // --- 3. GOAL-BASED CALCULATION STRATEGIES ---
    function runPlannerMode() {
        console.log("DEBUG: Running Planner Mode.");
        mainResultsContainer.classList.add('hidden');
        chartsContainer.classList.remove('hidden');
        updateLiveResults();
    }
    function findOptimalStrategy() {
        console.log("DEBUG: Starting findOptimalStrategy function.");
        chartsContainer.classList.add('hidden');
        mainResultsContainer.classList.remove('hidden');
        mainResultsContainer.innerHTML = `<div class="text-center p-4">Calculating...</div>`;
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
                console.log("DEBUG: Optimal strategy found!", bestScenario);
                displayOptimalResults(bestScenario);
            } else {
                console.log("DEBUG: No viable strategy found.");
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found.</div>`;
            }
        }, 100);
    }
    function findMinimumTime() {
        console.log("DEBUG: Starting findMinimumTime function.");
        chartsContainer.classList.add('hidden');
        mainResultsContainer.classList.remove('hidden');
        mainResultsContainer.innerHTML = `<div class="text-center p-4">"Minimum Time" feature is coming soon!</div>`;
    }

    // --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---
    function updateLiveResults() { /* ... same as before ... */ }
    function displayOptimalResults(scenario) { /* ... same as before ... */ }
    function createResultCard(label, value, color, isLarge = false) { /* ... same as before ... */ }
    function updatePieChart(emi, investment) { /* ... same as before ... */ }
    function syncAndStyle(inputElement, sliderElement) { /* ... same as before ... */ }
    
    function handleGoalSelection(selectedButton) {
        // --- DEBUG: LOG WHICH BUTTON WAS CLICKED ---
        console.log(`DEBUG: handleGoalSelection called for button with goal: "${selectedButton.dataset.goal}"`);

        goalButtons.forEach(button => button.classList.remove('selected'));
        selectedButton.classList.add('selected');
        const goal = selectedButton.dataset.goal;
        const isPlannerMode = goal === 'planner';
        const tenureFields = [loanTenureInput, loanTenureSlider, investmentTenureInput, investmentTenureSlider];
        tenureFields.forEach(field => { field.disabled = !isPlannerMode; });
        loanTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        investmentTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        
        if (goal === 'planner') runPlannerMode();
        else if (goal === 'min-time') findMinimumTime();
        else if (goal === 'optimal-strategy') findOptimalStrategy();
    }

    // --- 5. INITIALIZATION ---
    console.log("DEBUG: Setting up event listeners.");
    ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay', 'loanTenureDisplay', 'investmentTenureDisplay'].forEach(id => {
        syncAndStyle(document.getElementById(id), document.getElementById(id.replace('Display', '') + 'Slider'));
    });
    goalButtons.forEach(button => {
        button.addEventListener('click', () => handleGoalSelection(button));
    });
    handleGoalSelection(document.querySelector('.goal-button.selected'));
    updateLiveResults();
    console.log("DEBUG: PaiFinance initialization complete.");
});
