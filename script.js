/**
 * PaiFinance - Interactive Script
 * Version: 19.1 - FINAL STABLE
 * Last updated: September 9, 2025, 11:36 PM IST
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
    const investmentTenureLabel = document.getElementById('investmentTenureLabel');
    const emiResultElement = document.getElementById('emiResult');
    const monthlyInvestmentResult = document.getElementById('monthlyInvestmentResult');
    const monthlyInvestmentSubtext = document.getElementById('monthlyInvestmentSubtext');
    
    // Global state
    let planningHorizon = 20; // Default value, will be updated from onboarding

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
        if (monthlyInvestment <= 0 || annualRate < 0 || tenureYears <= 0) return 0;
        const monthlyRate = (annualRate / 100) / 12;
        const tenureMonths = tenureYears * 12;
        if (monthlyRate === 0) { return monthlyInvestment * tenureMonths; }
        const fv = monthlyInvestment * ( (Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate );
        return Math.round(fv);
    }
    
    function calculateTenureMonths(principal, annualRate, emi) {
        if (principal <= 0 || annualRate <= 0 || emi <= 0) return 0;
        const monthlyRate = (annualRate / 100) / 12;
        if (emi <= principal * monthlyRate) return Infinity;
        const numerator = Math.log(emi / (emi - (principal * monthlyRate)));
        const denominator = Math.log(1 + monthlyRate);
        return numerator / denominator;
    }

    // --- 3. GOAL-BASED CALCULATION STRATEGIES ---

    function showWarningToast(message) {
        const warningToast = document.getElementById('warningToast');
        const warningMessage = document.getElementById('warningMessage');
        let toastTimeout;

        clearTimeout(toastTimeout);
        warningMessage.textContent = message;
        warningToast.classList.remove('hidden', 'opacity-0');
        warningToast.classList.add('opacity-100');

        toastTimeout = setTimeout(() => {
            warningToast.classList.remove('opacity-100');
            warningToast.classList.add('opacity-0');
            setTimeout(() => {
                warningToast.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    function runPlannerMode() {
        finalResultsSection.classList.remove('hidden');
        comparisonChartContainer.classList.remove('hidden');
        amortizationContainer.classList.remove('hidden');
        paiVsTraditionalContainer.classList.add('hidden');
        updatePlannerResults();
    }

    function findMinTimeToRepay() {
        finalResultsSection.classList.remove('hidden');
        comparisonChartContainer.classList.add('hidden');
        amortizationContainer.classList.remove('hidden');
        paiVsTraditionalContainer.classList.remove('hidden');
        mainResultsContainer.innerHTML = `<div class="text-center p-4">Calculating...</div>`;

        clearTimeout(calculationTimeout);
        calculationTimeout = setTimeout(() => {
            const principal = parseFloat(loanAmountInput.value);
            const budget = parseFloat(monthlyBudgetInput.value);
            const loanAnnualRate = parseFloat(loanInterestRateInput.value);
            const investmentAnnualRate = parseFloat(investmentRateInput.value);
            const totalPlanningHorizon = planningHorizon;

            if (budget <= (principal * (loanAnnualRate / 100 / 12))) {
                showWarningToast("Budget is too low to cover even the first month's interest.");
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Budget is insufficient to pay off the loan.</div>`;
                return;
            }

            const tenureMonths = calculateTenureMonths(principal, loanAnnualRate, budget);
            const loanTenureYears = tenureMonths / 12;

            if (loanTenureYears > totalPlanningHorizon) {
                 showWarningToast("Loan cannot be paid off within your planning horizon.");
                 mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Payoff time (${formatYearsAndMonths(loanTenureYears)}) exceeds your planning horizon.</div>`;
                 loanTenureInput.value = formatYearsAndMonths(loanTenureYears);
                 investmentTenureInput.value = "0 Years";
                 return;
            }
            
            const remainingHorizon = totalPlanningHorizon - loanTenureYears;
            const futureValue = calculateFutureValue(budget, investmentAnnualRate, remainingHorizon);
            const totalInterestPaid = (budget * tenureMonths) - principal;
            const netWealth = futureValue - totalInterestPaid;

            loanTenureInput.value = formatYearsAndMonths(loanTenureYears);
            investmentTenureInput.value = formatYearsAndMonths(remainingHorizon);
            loanTenureSlider.value = loanTenureYears;
            investmentTenureSlider.value = remainingHorizon;
            updateSliderProgress(loanTenureSlider);
            updateSliderProgress(investmentTenureSlider);

            const scenario = {
                tenure: loanTenureYears,
                investmentTenure: remainingHorizon,
                emi: budget,
                monthlyInvestment: 0,
                postLoanMonthlyInvestment: budget,
                totalInterestPaid,
                futureValue,
                netWealth,
                principal,
                loanAnnualRate,
                investmentAnnualRate
            };
            displayResults(scenario, 'Min Time To Repay');
        }, 500);
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
                loanTenureInput.value = formatYearsAndMonths(bestScenario.tenure);
                investmentTenureInput.value = formatYearsAndMonths(bestScenario.tenure);
                loanTenureSlider.value = bestScenario.tenure;
                investmentTenureSlider.value = bestScenario.tenure;
                updateSliderProgress(loanTenureSlider);
                updateSliderProgress(investmentTenureSlider);
                displayResults(bestScenario, 'Winning the Financial Race');
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">No viable strategy found. Your budget may be too low for this loan amount and interest rate.</div>`;
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
                loanTenureInput.value = formatYearsAndMonths(foundScenario.tenure);
                investmentTenureInput.value = formatYearsAndMonths(foundScenario.tenure);
                loanTenureSlider.value = foundScenario.tenure;
                investmentTenureSlider.value = foundScenario.tenure;
                updateSliderProgress(loanTenureSlider);
                updateSliderProgress(investmentTenureSlider);
                displayResults(foundScenario, 'The Race to Zero Debt', formatYearsAndMonths(foundScenario.tenure));
            } else {
                mainResultsContainer.innerHTML = `<div class="text-center p-4 text-danger">Cannot offset interest within 30 years. Try increasing your budget or the investment return rate.</div>`;
            }
        }, 500);
    }

    // --- 4. UI INTERACTIVITY & DISPLAY FUNCTIONS ---
    function updatePlannerResults() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(loanInterestRateInput.value);
        const tenureYears = parseFloat(loanTenureSlider.value);
        const budget = parseFloat(monthlyBudgetInput.value);
        const investmentRate = parseFloat(investmentRateInput.value);
        const investmentTenureYears = parseFloat(investmentTenureSlider.value);

        loanTenureInput.value = `${tenureYears} Y`;
        investmentTenureInput.value = `${investmentTenureYears} Y`;
        
        const emi = calculateEMI(principal, annualRate, tenureYears);

        monthlyBudgetInput.parentElement.classList.remove('animated-border');
        emiResultElement.parentElement.classList.remove('animated-border');

        if (budget < emi && emi > 0) {
            showWarningToast('Monthly EMI cannot exceed your budget.');
            monthlyBudgetInput.parentElement.classList.add('animated-border');
            emiResultElement.parentElement.classList.add('animated-border');
            emiResultElement.textContent = `₹ ${emi.toLocaleString('en-IN')}`;
            monthlyInvestmentResult.textContent = '₹ 0';
            updatePieChart(emi, 0);
            finalResultsSection.classList.add('hidden');
            summaryResultsContainer.classList.add('hidden');
            return;
        }

        const investment = (budget >= emi) ? budget - emi : 0;
        const totalInterestPaid = (emi * tenureYears * 12) - principal;
        const futureValue = calculateFutureValue(investment, investmentRate, investmentTenureYears);
        const netWealth = futureValue - totalInterestPaid;
        const scenario = { tenure: tenureYears, investmentTenure: investmentTenureYears, emi, monthlyInvestment: investment, totalInterestPaid, futureValue, netWealth, principal, loanAnnualRate: annualRate, investmentAnnualRate: investmentRate };
        
        finalResultsSection.classList.remove('hidden');
        displayResults(scenario, 'Your Strategy Visualised');
    }
    
    function formatYearsAndMonths(decimalYears) {
        if (!decimalYears || decimalYears < 0) return "0 M";
        const years = Math.floor(decimalYears);
        const months = Math.round((decimalYears - years) * 12);
        if (years > 0 && months > 0) return `${years} Y, ${months} M`;
        if (years > 0) return `${years} Y`;
        if (months > 0) return `${months} M`;
        return "0 M";
    }

    function displayResults(scenario, title, tenureString = null) {
        const displayTenure = tenureString || formatYearsAndMonths(scenario.tenure);
        
        emiResultElement.textContent = `₹ ${scenario.emi.toLocaleString('en-IN')}`;
        
        if (title === 'Min Time To Repay') {
            monthlyInvestmentResult.textContent = `₹ ${scenario.postLoanMonthlyInvestment.toLocaleString('en-IN')}`;
            monthlyInvestmentSubtext.textContent = '(after loan)';
            monthlyInvestmentSubtext.classList.remove('hidden');
        } else {
            const investmentAmount = scenario.monthlyInvestment || 0;
            monthlyInvestmentResult.textContent = `₹ ${investmentAmount.toLocaleString('en-IN')}`;
            monthlyInvestmentSubtext.classList.add('hidden');
        }
        updatePieChart(scenario.emi, scenario.monthlyInvestment || 0);
        
        const investmentTenureForCalc = scenario.investmentTenure || scenario.tenure;
        const totalInvested = scenario.postLoanMonthlyInvestment 
            ? 0
            : (scenario.monthlyInvestment || 0) * Math.round(investmentTenureForCalc * 12);
            
        const totalGains = scenario.futureValue - (scenario.postLoanMonthlyInvestment ? (scenario.postLoanMonthlyInvestment * scenario.investmentTenure * 12) : totalInvested);
        const totalPaid = scenario.principal + scenario.totalInterestPaid;
        
        mainResultsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                ${createWidgetCard('Loan Details', scenario, 'primary', displayTenure)}
                ${createWidgetCard('Investment Details', scenario, 'success', formatYearsAndMonths(scenario.investmentTenure), totalInvested, totalGains)}
                ${createResultCard('Net Money Input', scenario, 'warning', totalInvested, totalPaid)}
                ${createResultCard('Net Money Output', scenario, 'success', totalInvested, totalGains)}
            </div>
        `;

        renderWidgetCharts(scenario, totalInvested, totalGains);
        const chartData = generateComparisonData(scenario);
        renderComparisonChart(chartData);

        const crossoverYearText = chartData.crossoverYear ? `The key moment is in <strong>Year ${chartData.crossoverYear}</strong>, where your investment value is projected to surpass your outstanding loan balance.` : '';

        chartExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">${title}</h4>
            <p>This chart visualizes the power of your strategy. Your loan balance will be <strong>₹0</strong> after ${displayTenure}, while your total wealth is projected to grow to <strong>₹${scenario.futureValue.toLocaleString('en-IN')}</strong> by the end of your planning horizon.</p>
            <p class="mt-2">${crossoverYearText}</p>
        `;

        const amortizationData = generateAmortizationSchedule(scenario);
        renderAmortizationTable(amortizationData);
        amortizationExplanation.innerHTML = `
            <h4 class="text-lg font-bold text-textdark mb-2 pt-4">Loan Amortization Schedule</h4>
            <p>This schedule shows how your accelerated payments quickly pay down your loan. You can see how much of your annual payments go towards the principal versus the interest until the loan is fully paid off.</p>
        `;

        if (title !== 'Your Strategy Visualised') {
            paiVsTraditionalContainer.classList.remove('hidden');
            const paiVsTraditionalData = generatePaiVsTraditionalData(scenario);
            renderPaiVsTraditionalChart(paiVsTraditionalData);
            paiVsTraditionalExplanation.innerHTML = `
                <h4 class="text-lg font-bold text-textdark mb-2 pt-4">PaiFinance vs. Traditional Loans</h4>
                <p>The <span class="font-semibold text-danger">red line</span> shows your net position with a traditional loan, ending at <strong class="text-danger">-₹${scenario.totalInterestPaid.toLocaleString('en-IN')}</strong>.</p>
                <p class="mt-2">The <span class="font-semibold text-investment_green">green line</span> shows how this strategy helps you build positive net wealth, ending at <strong class="text-investment_green">₹${scenario.netWealth.toLocaleString('en-IN')}</strong>.</p>
            `;
        } else {
             paiVsTraditionalContainer.classList.add('hidden');
        }
        
        updateSummaryBox(scenario, title, displayTenure, chartData.crossoverYear);
    }

    // ... All other display and chart functions like createWidgetCard, renderComparisonChart, etc. are here ...
    // NOTE: For brevity, they are not repeated. The versions from the previous step are correct.
    // The functions below are the ones with the most critical logic updates.

    function handleGoalSelection(selectedButton) {
        goalButtons.forEach(button => button.classList.remove('selected'));
        selectedButton.classList.add('selected');
        const goal = selectedButton.dataset.goal;
        const isPlannerMode = goal === 'planner';
    
        loanTenureInput.readOnly = !isPlannerMode;
        investmentTenureInput.readOnly = !isPlannerMode;
        loanTenureSlider.disabled = !isPlannerMode;
        investmentTenureSlider.disabled = !isPlannerMode;
    
        loanTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
        investmentTenureContainer.style.opacity = isPlannerMode ? '1' : '0.5';
    
        investmentTenureLabel.textContent = (goal === 'min-time-repay') ? 'Remaining Planning Horizon' : 'Investment Tenure';
    
        if(isPlannerMode) {
            loanTenureInput.value = `${loanTenureSlider.value} Y`;
            investmentTenureInput.value = `${investmentTenureSlider.value} Y`;
        }

        triggerCalculation();
    }
    
    // --- 5. INITIALIZATION ---
    function initializeApp() {
        ['loanAmount', 'monthlyBudget', 'loanInterestRateDisplay', 'investmentRateDisplay'].forEach(id => {
            const inputEl = document.getElementById(id);
            const sliderEl = document.getElementById(id.replace('Display', '') + 'Slider');
            if(inputEl && sliderEl) syncAndStyle(inputEl, sliderEl);
        });

        // Special handling for tenure inputs which can be text or number
        [loanTenureSlider, investmentTenureSlider].forEach(slider => {
            slider.addEventListener('input', () => {
                if (!slider.disabled) {
                    const correspondingInput = slider.id === 'loanTenureSlider' ? loanTenureInput : investmentTenureInput;
                    correspondingInput.value = `${slider.value} Y`;
                    triggerCalculation();
                }
            });
        });

        [loanTenureInput, investmentTenureInput].forEach(input => {
            input.addEventListener('input', () => {
                if (!input.readOnly) {
                    const correspondingSlider = input.id === 'loanTenureDisplay' ? loanTenureSlider : investmentTenureSlider;
                    const val = parseFloat(input.value);
                    if (!isNaN(val) && val >= correspondingSlider.min && val <= correspondingSlider.max) {
                        correspondingSlider.value = val;
                        updateSliderProgress(correspondingSlider);
                        triggerCalculation();
                    }
                }
            });
        });
        
        // Listener for onboarding completion
        document.addEventListener('onboardingComplete', (e) => {
            const { budget, tenure } = e.detail;
            monthlyBudgetInput.value = budget;
            planningHorizon = tenure;
            updateSliderProgress(monthlyBudgetSlider);
            triggerCalculation();
        });

        goalButtons.forEach(button => { button.addEventListener('click', () => handleGoalSelection(button)); });
        finalResultsSection.classList.add('hidden');
        handleGoalSelection(document.querySelector('.goal-button.selected'));
    }

    initializeApp();

    // Make sure all other functions (createResultCard, renderWidgetCharts, generateAmortizationSchedule, etc.) are included below.
    // The previous full file contains the correct versions of them.
});
