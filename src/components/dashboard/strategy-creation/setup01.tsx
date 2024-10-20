// ObjectivePage.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles/ObjectivePage.module.css';
import StepIndicator from './StepIndicator';
import { createClient } from '../../../../utils/supabase/client';

const ObjectivePage: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        objective: '',
        budget: '',
        manageInquiries: '',
        trafficUrl: ''
    });

    const [currency, setCurrency] = useState<string>(''); // User's currency
    const [exchangeRate, setExchangeRate] = useState<number>(1); // Exchange rate to USD
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Validation errors

    // Fetch currency and exchange rate from Supabase
    const fetchCurrencyAndExchangeRate = async () => {
        try {
            const supabase = createClient();

            // Retrieve user_id from localStorage
            const user_id = localStorage.getItem('userid');

            if (!user_id) {
                console.error('User ID not found in localStorage');
                return;
            }

            // Fetch currency from facebookData based on user_id
            const { data, error } = await supabase
                .from('facebookData')
                .select('currency')
                .eq('user_id', user_id)
                .single();

            if (error) {
                console.error('Error fetching currency from Supabase:', error);
            } else if (data) {
                const userCurrency = data.currency;
                setCurrency(userCurrency);

                // Fetch exchange rate
                const fetchedExchangeRate = await getExchangeRate(userCurrency);
                setExchangeRate(fetchedExchangeRate);
            } else {
                console.error('No connected ad account found for the user.');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    // Fetch the currency and exchange rate on component mount
    useEffect(() => {
        fetchCurrencyAndExchangeRate();
    }, []);

    // Function to get the exchange rate to USD
    const getExchangeRate = async (currency: string): Promise<number> => {
        const apiKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY;
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${currency}/USD`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.conversion_rate) {
                return data.conversion_rate;
            } else {
                console.error('Error fetching exchange rate:', data);
                return 1;
            }
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            return 1;
        }
    };

    // Function to format currency amounts
    const formatCurrency = (amount: number): string => {
        return amount.toFixed(2);
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        // Validate the input field
        validateField(name, value);
    };

    // Validate individual form fields
    const validateField = (fieldName: string, value: string) => {
        let fieldErrors = { ...errors };

        switch (fieldName) {
            case 'objective':
                if (!value) {
                    fieldErrors.objective = 'Please select an objective.';
                } else {
                    delete fieldErrors.objective;
                }
                break;
            case 'budget':
                const budgetInUserCurrency = parseFloat(value);
                if (isNaN(budgetInUserCurrency) || budgetInUserCurrency <= 0) {
                    fieldErrors.budget = 'Please enter a valid budget amount.';
                } else if (exchangeRate) {
                    const budgetInUSD = budgetInUserCurrency * exchangeRate;
                    if (budgetInUSD < 180) {
                        const minimumBudgetInUserCurrency = 180 / exchangeRate;
                        fieldErrors.budget = `The budget must be at least ${formatCurrency(minimumBudgetInUserCurrency)} ${currency}.`;
                    } else {
                        delete fieldErrors.budget;
                    }
                }
                break;
            case 'manageInquiries':
                if (!value) {
                    fieldErrors.manageInquiries = 'Please select an option.';
                } else {
                    delete fieldErrors.manageInquiries;
                }
                break;
            case 'trafficUrl':
                if (formData.objective === 'sales' && !value) {
                    fieldErrors.trafficUrl = 'Please enter a URL for the sales objective.';
                } else {
                    delete fieldErrors.trafficUrl;
                }
                break;
            default:
                break;
        }

        setErrors(fieldErrors);
    };

    // Validate the entire form
    const validateForm = () => {
        let valid = true;
        let fieldErrors = { ...errors };

        // Validate each field
        if (!formData.objective) {
            fieldErrors.objective = 'Please select an objective.';
            valid = false;
        }

        const budgetInUserCurrency = parseFloat(formData.budget);
        if (isNaN(budgetInUserCurrency) || budgetInUserCurrency <= 0) {
            fieldErrors.budget = 'Please enter a valid budget amount.';
            valid = false;
        } else if (exchangeRate) {
            const budgetInUSD = budgetInUserCurrency * exchangeRate;
            if (budgetInUSD < 180) {
                const minimumBudgetInUserCurrency = 180 / exchangeRate;
                fieldErrors.budget = `The budget must be at least ${formatCurrency(minimumBudgetInUserCurrency)} ${currency}.`;
                valid = false;
            }
        }

        if (!formData.manageInquiries) {
            fieldErrors.manageInquiries = 'Please select an option.';
            valid = false;
        }

        if (formData.objective === 'sales' && !formData.trafficUrl) {
            fieldErrors.trafficUrl = 'Please enter a URL for the sales objective.';
            valid = false;
        }

        setErrors(fieldErrors);
        return valid;
    };

    // Function to store form data in Supabase
    const storeDataInSupabase = async () => {
        try {
            const supabase = createClient();

            // Retrieve user_id from localStorage
            const user_id = localStorage.getItem('userid');

            if (!user_id) {
                console.error('User ID not found in localStorage');
                return;
            }

            const { data, error } = await supabase
                .from('ads_strategy') // Use your actual table name
                .insert([{
                    user_id: user_id,
                    objective: formData.objective,
                    budget: formData.budget,
                    manage_inquiries: formData.manageInquiries,
                    traffic_url: formData.trafficUrl,
                }]);

            if (error) {
                console.error('Error inserting data:', error);
            } else {
                console.log('Data inserted:', data);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    // Handle continue button click
    const handleContinue = async () => {
        // Validate the form before submission
        if (validateForm()) {
            await storeDataInSupabase(); // Store the form data in Supabase
            router.push('/dashboard/strategy/strategycreation'); // Navigate to the next page
        } else {
            // Scroll to the first error field
            const firstErrorField = document.querySelector(`.${styles.errorInput}`);
            if (firstErrorField) {
                (firstErrorField as HTMLElement).focus();
            }
        }
    };

    // Determine if the form is valid
    const isFormValid = Object.keys(errors).length === 0 &&
        formData.objective &&
        formData.budget &&
        formData.manageInquiries &&
        (formData.objective !== 'sales' || formData.trafficUrl);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Strategy Creation</h2>
            <p className={styles.description}>
                Introducing Woortec - the ultimate social media ads product designed to elevate your online presence and drive results like never before. With Woortec, you can effortlessly create and manage ads across multiple social media platforms, all in one place.
            </p>
            <div className={styles.tabContainer}>
                <StepIndicator />
            </div>
            <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                    <label htmlFor="objective" className={styles.label}>What is the primary objective you aim to achieve with this investment?</label>
                    <select
                        id="objective"
                        name="objective"
                        className={`${styles.select} ${errors.objective ? styles.errorInput : ''}`}
                        value={formData.objective}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.objective}
                        aria-describedby={errors.objective ? 'objective-error' : undefined}
                    >
                        <option value="">Select the best option</option>
                        <option value="Brand Awareness">Are you aiming to enhance your brand&apos;s visibility and foster community engagement?</option>
                        <option value="Sales">Would you like to drive more traffic to your website and increase sales conversions?</option>
                        <option value="Lead Generation">Are you seeking to gather information from potential customers via a quick form, creating a robust database of prospective clients, even if immediate conversions may vary?</option>
                    </select>
                    {errors.objective && (
                        <div id="objective-error" className={styles.errorMessage}>
                            {errors.objective}
                        </div>
                    )}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="budget" className={styles.label}>What is the budget you are willing to allocate for this campaign?</label>
                    <div className={styles.budgetInputContainer}>
                        <input
                            type="number"
                            name="budget"
                            id="budget"
                            className={`${styles.input} ${errors.budget ? styles.errorInput : ''}`}
                            placeholder="Enter the amount"
                            value={formData.budget}
                            onChange={handleInputChange}
                            aria-invalid={!!errors.budget}
                            aria-describedby={errors.budget ? 'budget-error' : undefined}
                            min="0"
                            step="0.01"
                        />
                        {currency && (
                            <input
                                type="text"
                                className={styles.currencyDisplay}
                                value={currency}
                                readOnly
                                tabIndex={-1}
                            />
                        )}
                    </div>
                    {errors.budget && (
                        <div id="budget-error" className={styles.errorMessage}>
                            {errors.budget}
                        </div>
                    )}
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Are you able to manage and respond to customer inquiries generated through this campaign?</label>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                id="yes"
                                name="manageInquiries"
                                value="yes"
                                checked={formData.manageInquiries === 'yes'}
                                onChange={handleInputChange}
                                className={styles.radioInput}
                                aria-invalid={!!errors.manageInquiries}
                                aria-describedby={errors.manageInquiries ? 'manageInquiries-error' : undefined}
                            />
                            Yes
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                id="no"
                                name="manageInquiries"
                                value="no"
                                checked={formData.manageInquiries === 'no'}
                                onChange={handleInputChange}
                                className={styles.radioInput}
                                aria-invalid={!!errors.manageInquiries}
                                aria-describedby={errors.manageInquiries ? 'manageInquiries-error' : undefined}
                            />
                            No
                        </label>
                    </div>
                    {errors.manageInquiries && (
                        <div id="manageInquiries-error" className={styles.errorMessage}>
                            {errors.manageInquiries}
                        </div>
                    )}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="trafficUrl" className={styles.label}>Where do you want to direct the traffic to?</label>
                    <input
                        type="url"
                        name="trafficUrl"
                        id="trafficUrl"
                        className={`${styles.input} ${errors.trafficUrl ? styles.errorInput : ''}`}
                        placeholder="Please enter a URL"
                        value={formData.trafficUrl}
                        onChange={handleInputChange}
                        aria-invalid={!!errors.trafficUrl}
                        aria-describedby={errors.trafficUrl ? 'trafficUrl-error' : undefined}
                    />
                    {errors.trafficUrl && (
                        <div id="trafficUrl-error" className={styles.errorMessage}>
                            {errors.trafficUrl}
                        </div>
                    )}
                </div>
            </div>
            <button
                className={styles.continueButton}
                onClick={handleContinue}
                disabled={!isFormValid}
                aria-disabled={!isFormValid}
            >
                Continue
            </button>
        </div>
    );
};

export default ObjectivePage;
