/**
 * PaiFinance - Interactive Script
 * Version: 2.2 - Minimum Time Engine COMPLETE
 * Last updated: August 13, 2025, 10:45 AM IST
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

    const chartsContainer = document.getElementById('chartsContainer');
    const goalButtons = document.querySelectorAll('.goal-button');
    const chartCanvas = document.getElementById('monthlyBudgetChart');
    const chartMessage = document.getElementById('chartMessage');
    let monthlyBudgetChart = null;

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
        updateLiveResults();
    }

    function findOptimalStrategy() {
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
                displayResults(bestScenario, 'Optimal Strategy');
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found. Try increasing your budget.</div>`;
            }
        }, 100);
    }

    function findMinimumTime() {
        finalResultsSection.classList.remove('hidden');
        mainResultsContainer.innerHTML = `<div class="text-center p-4">Calculating minimum time to offset interest...</div>`;

        setTimeout(() => {
            const principal = parseFloat(loanAmountInput.value);
            const budget = parseFloat(monthlyBudgetInput.value);
            const loanAnnualRate = parseFloat(loanInterestRateInput.value);
            const investmentAnnualRate = parseFloat(investmentRateInput.value);
            let foundScenario = null;

            // Loop month by month for precision
            for (let months = 1; months <= 360; months++) {
                const tenureInYears = months / 12;
                const emi = calculateEMI(principal, loanAnnualRate, tenureInYears);

                if (emi > budget) continue;

                const monthlyInvestment = budget - emi;
                const totalInterestPaid = (emi * months) - principal;
                const futureValue = calculateFutureValue(monthlyInvestment, investmentAnnualRate, tenureInYears);

                // Check if the investment growth has caught up to the interest cost
                if (futureValue >= totalInterestPaid) {
                    const netWealth = futureValue - totalInterestPaid;
                    foundScenario = {
                        tenure: tenureInYears,
                        emi,
                        monthlyInvestment,
                        totalInterestPaid,
                        futureValue,
                        netWealth
                    };
                    break; // Exit the loop as soon as we find the first match
                }
            }

            if (foundScenario) {
                // Convert tenure to years and months for display
                const years = Math.floor(foundScenario.tenure);
                const remainingMonths = Math.round((foundScenario.tenure - years) * 12);
                const tenureString = `${years} Years, ${remainingMonths} Months`;
                
                displayResults(foundScenario, 'Minimum Time', tenureString);
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">It's not possible to offset interest within 30 years with this budget.</div>`;
            }
        }, 100);
    }

    // --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---
    function updateLiveResults() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(loanInterestRateInput.value);
        const tenureYears = parseFloat(loanTenureInput.value);
        const budget = parseFloat(monthlyBudgetInput.value);
        const investmentRate = parseFloat(investmentRateInput.value);

        const emi = calculateEMI(principal, annualRate, tenureYears);
        emiResultElement.textContent = `₹ ${emi.toLocaleString('en-IN')}`;
        
        const investment = (budget >= emi) ? budget - emi : 0;
        monthlyInvestmentResult.textContent = `₹ ${investment.toLocaleString('en-IN')}`;
        updatePieChart(emi, investment);

        if (document.querySelector('.goal-button.selected').dataset.goal === 'planner') {
            const totalInterestPaid = (emi * tenureYears * 12) - principal;
            const futureValue = calculateFutureValue(investment, investmentRate, tenureYears);
            const netWealth = futureValue - totalInterestPaid;
            const scenario = { tenure: tenureYears, emi, monthlyInvestment: investment, totalInterestPaid, futureValue, netWealth };
            displayResults(scenario, 'Manual Plan');
        }
    }

    function displayResults(scenario, title, tenureString = null) {
        const displayTenure = tenureString || `${scenario.tenure} Years`;

        if (title.includes('Optimal') || title.includes('Minimum')) {
            loanTenureInput.value = Math.round(scenario.tenure);
            investmentTenureInput.value = Math.round(scenario.tenure);
            loanTenureInput.dispatchEvent(new Event('input', { bubbles:true }));
            investmentTenureInput.dispatchEvent(new Event('input', { bubbles:true }));
        }

        mainResultsContainer.innerHTML = `
            <h2 class="text-2xl font-bold text-textdark font-albert_sans mb-4 text-center">${title} Results</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${createResultCard('Loan Details', `Tenure: ${displayTenure}<br>Monthly EMI: ₹${scenario.emi.toLocaleString('en-IN')}`, 'primary')}
                ${createResultCard('Investment Details', `Monthly SIP: ₹${scenario.monthlyInvestment.toLocaleString('en-IN')}<br>Total Wealth Built: ₹${scenario.futureValue.toLocaleString('en-IN')}`, 'success')}
                ${createResultCard('Net Money Input', `Total Paid: ₹${(scenario.emi * Math.round(scenario.tenure * 12)).toLocaleString('en-IN')}`, 'warning')}
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

        sliderElement.addEventListener('input', () => { 
            inputElement.value = sliderElement.value; 
            updateSliderProgress(); 
            handleInput();
        });
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

    // --- 5. INITIALIZATION ---
    function initializeApp() {
        ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay', 'loanTenureDisplay', 'investmentTenureDisplay'].forEach(id => {
            syncAndStyle(document.getElementById(id), document.getElementById(id.replace('Display', '') + 'Slider'));
        });
        goalButtons.forEach(button => { button.addEventListener('click', () => handleGoalSelection(button)); });
        
        handleGoalSelection(document.querySelector('.goal-button.selected'));
        
        console.log("PaiFinance initialization complete.");
    }

    initializeApp();
});
