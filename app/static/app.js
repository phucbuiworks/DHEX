document.addEventListener('DOMContentLoaded', () => {

    function setupWidget(prefix) {
        const amountInput = document.getElementById(`${prefix}-input-amount`);
        const outputAmount = document.getElementById(`${prefix}-output-amount`);
        const baseCurrency = document.getElementById(`${prefix}-base-currency`);
        const targetCurrency = document.getElementById(`${prefix}-target-currency`);
        const swapBtn = document.getElementById(`${prefix}-swap-btn`);
        const rateDisplay = document.getElementById(`${prefix}-rate-display`);
        const errorMessage = document.getElementById(`${prefix}-error-message`);

        // Safely check if elements exist (so standard DOM errors don't crash the script)
        if (!amountInput) return;

        let debounceTimer;

        const fetchConversion = async () => {
            const amount = parseFloat(amountInput.value);
            const base = baseCurrency.value;
            const target = targetCurrency.value;

            if (isNaN(amount) || amount <= 0) {
                outputAmount.value = '';
                rateDisplay.textContent = '';
                errorMessage.classList.add('hidden');
                return;
            }

            if (base === target) {
                outputAmount.value = amount.toFixed(4);
                rateDisplay.textContent = `1 ${base} = 1 ${target}`;
                errorMessage.classList.add('hidden');
                return;
            }

            try {
                outputAmount.placeholder = 'Converting...';
                errorMessage.classList.add('hidden');

                const response = await fetch(`/convert?amount=${amount}&base_currency=${base}&target_currency=${target}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.detail || 'Conversion failed');
                }

                outputAmount.value = data.converted_amount.toFixed(4);
                rateDisplay.textContent = `1 ${base} = ${data.conversion_rate} ${target}`;
                outputAmount.placeholder = '0.00';

            } catch (error) {
                console.error(`Error fetching conversion for ${prefix}:`, error);
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
                outputAmount.value = '';
                rateDisplay.textContent = '';
            }
        };

        const triggerUpdate = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(fetchConversion, 300);
        };

        amountInput.addEventListener('input', triggerUpdate);
        baseCurrency.addEventListener('change', triggerUpdate);
        targetCurrency.addEventListener('change', triggerUpdate);

        swapBtn.addEventListener('click', () => {
            const temp = baseCurrency.value;
            baseCurrency.value = targetCurrency.value;
            targetCurrency.value = temp;
            triggerUpdate();
        });

        // Initial fetch
        triggerUpdate();
    }

    // Initialize both independent widgets
    setupWidget('fiat');
    setupWidget('crypto');
});
