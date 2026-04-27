document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('input-amount');
    const outputAmount = document.getElementById('output-amount');
    const baseCurrency = document.getElementById('base-currency');
    const targetCurrency = document.getElementById('target-currency');
    const swapBtn = document.getElementById('swap-btn');
    const rateDisplay = document.getElementById('rate-display');
    const errorMessage = document.getElementById('error-message');

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
            outputAmount.value = amount.toFixed(2);
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

            outputAmount.value = data.converted_amount.toFixed(2);
            rateDisplay.textContent = `1 ${base} = ${data.conversion_rate} ${target}`;
            outputAmount.placeholder = '0.00';

        } catch (error) {
            console.error('Error fetching conversion:', error);
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
});
