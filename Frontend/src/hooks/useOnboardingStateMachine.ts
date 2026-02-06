import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type OnboardingStep = 1 | 2 | 3;
export type OnboardingStatus = 'in_progress' | 'completed';
export type OnboardingMode = 'ASK' | 'WAIT' | 'SAVE' | 'COMPLETE';

export interface OnboardingState {
    step: OnboardingStep;
    status: OnboardingStatus;
    mode: OnboardingMode;
    validationErrors: string[];
    loading: boolean;
}

export interface Step1Data {
    fullName: string;
    mobileNumber: string;
    age: number;
    password: string;
    email?: string;
    residentialAddress?: string;
}

export interface Step2Data {
    state: string;
    district: string;
    village: string;
}

export interface Step3Data {
    landSizeValue: number;
    landSizeUnit: 'acres';
    soilType: 'Alluvial' | 'Black' | 'Red' | 'Laterite' | 'Mixed';
    waterAvailability: 'Borewell' | 'Canal' | 'Rainfed' | 'Mixed';
    mainCropsGrown?: string[];
    otherCrop?: string;
}

export function useOnboardingStateMachine(userId: string, role: string) {
    const [state, setState] = useState<OnboardingState>({
        step: 1,
        status: 'in_progress',
        mode: 'ASK',
        validationErrors: [],
        loading: true,
    });

    // Initialize state from Firestore on mount
    useEffect(() => {
        const initializeState = async () => {
            if (role !== 'farmer') {
                setState(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const currentStep = (userData.signup_step || 1) as OnboardingStep;
                    const currentStatus = (userData.signup_status || 'in_progress') as OnboardingStatus;

                    setState({
                        step: currentStep,
                        status: currentStatus,
                        mode: currentStatus === 'completed' ? 'COMPLETE' : 'ASK',
                        validationErrors: [],
                        loading: false,
                    });
                } else {
                    setState(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('Error initializing onboarding state:', error);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        initializeState();
    }, [userId, role]);

    // Validation functions
    const validateStep1 = (data: Partial<Step1Data>): string[] => {
        const errors: string[] = [];

        if (!data.fullName || data.fullName.trim().length === 0) {
            errors.push('Full name is required');
        }

        if (!data.mobileNumber || !/^\d{10}$/.test(data.mobileNumber)) {
            errors.push('Mobile number must be exactly 10 digits');
        }

        if (!data.age || data.age < 18 || data.age > 100) {
            errors.push('Age must be between 18 and 100');
        }

        if (!data.password || data.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        return errors;
    };

    const validateStep2 = (data: Partial<Step2Data>): string[] => {
        const errors: string[] = [];

        if (!data.state || data.state.trim().length === 0) {
            errors.push('State is required');
        }

        if (!data.district || data.district.trim().length === 0) {
            errors.push('District is required');
        }

        if (!data.village || data.village.trim().length === 0) {
            errors.push('Village/Town is required');
        }

        return errors;
    };

    const validateStep3 = (data: Partial<Step3Data>): string[] => {
        const errors: string[] = [];

        if (!data.landSizeValue || data.landSizeValue <= 0) {
            errors.push('Land size must be greater than 0');
        }

        if (!data.soilType) {
            errors.push('Soil type is required');
        }

        if (!data.waterAvailability) {
            errors.push('Water availability is required');
        }

        return errors;
    };

    // Save step data to Firestore
    const saveStep1 = async (data: Step1Data): Promise<boolean> => {
        setState(prev => ({ ...prev, mode: 'SAVE', loading: true }));

        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(
                userRef,
                {
                    role: 'farmer',
                    name: data.fullName, // Update the name field (replaces 'Farmer' placeholder)
                    fullName: data.fullName,
                    mobileNumber: data.mobileNumber,
                    age: data.age.toString(), // Update the age field (replaces '0' placeholder)
                    email: data.email || '',
                    residentialAddress: data.residentialAddress || '',
                    address: data.residentialAddress || '', // Update address field (replaces '' placeholder)
                    signup_step: 1,
                    signup_status: 'in_progress',
                    onboardingCompleted: false,
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            setState(prev => ({
                ...prev,
                mode: 'WAIT',
                loading: false,
                validationErrors: [],
            }));

            return true;
        } catch (error) {
            console.error('Error saving Step 1:', error);
            setState(prev => ({
                ...prev,
                mode: 'ASK',
                loading: false,
                validationErrors: ['Failed to save data. Please try again.'],
            }));
            return false;
        }
    };

    const saveStep2 = async (data: Step2Data): Promise<boolean> => {
        setState(prev => ({ ...prev, mode: 'SAVE', loading: true }));

        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(
                userRef,
                {
                    farmerProfile: {
                        location: {
                            state: data.state,
                            district: data.district,
                            village: data.village,
                        },
                    },
                    signup_step: 2,
                },
                { merge: true }
            );

            setState(prev => ({
                ...prev,
                mode: 'WAIT',
                loading: false,
                validationErrors: [],
            }));

            return true;
        } catch (error) {
            console.error('Error saving Step 2:', error);
            setState(prev => ({
                ...prev,
                mode: 'ASK',
                loading: false,
                validationErrors: ['Failed to save data. Please try again.'],
            }));
            return false;
        }
    };

    const saveStep3 = async (data: Step3Data): Promise<boolean> => {
        setState(prev => ({ ...prev, mode: 'SAVE', loading: true }));

        try {
            const userRef = doc(db, 'users', userId);

            // Combine crops
            const finalCrops = [...(data.mainCropsGrown || [])];
            if (data.otherCrop && !finalCrops.includes(data.otherCrop)) {
                finalCrops.push(data.otherCrop);
            }

            await setDoc(
                userRef,
                {
                    farmerProfile: {
                        landSize: {
                            value: data.landSizeValue,
                            unit: data.landSizeUnit,
                        },
                        soilType: data.soilType,
                        waterAvailability: data.waterAvailability,
                        crops: finalCrops,
                    },
                    signup_step: 3,
                    signup_status: 'completed',
                    onboardingCompleted: true,
                },
                { merge: true }
            );

            setState(prev => ({
                ...prev,
                step: 3,
                status: 'completed',
                mode: 'COMPLETE',
                loading: false,
                validationErrors: [],
            }));

            return true;
        } catch (error) {
            console.error('Error saving Step 3:', error);
            setState(prev => ({
                ...prev,
                mode: 'ASK',
                loading: false,
                validationErrors: ['Failed to save data. Please try again.'],
            }));
            return false;
        }
    };

    // Handle NEXT_CLICKED event
    const handleNextClicked = async (stepData: Step1Data | Step2Data | Step3Data): Promise<boolean> => {
        // Validate based on current step
        let errors: string[] = [];

        if (state.step === 1) {
            errors = validateStep1(stepData as Step1Data);
            if (errors.length === 0) {
                const success = await saveStep1(stepData as Step1Data);
                if (success) {
                    setState(prev => ({ ...prev, step: 2, mode: 'ASK' }));
                    return true;
                }
            }
        } else if (state.step === 2) {
            errors = validateStep2(stepData as Step2Data);
            if (errors.length === 0) {
                const success = await saveStep2(stepData as Step2Data);
                if (success) {
                    setState(prev => ({ ...prev, step: 3, mode: 'ASK' }));
                    return true;
                }
            }
        } else if (state.step === 3) {
            errors = validateStep3(stepData as Step3Data);
            if (errors.length === 0) {
                const success = await saveStep3(stepData as Step3Data);
                return success;
            }
        }

        // If validation failed, update errors
        if (errors.length > 0) {
            setState(prev => ({ ...prev, validationErrors: errors }));
            return false;
        }

        return false;
    };

    // Handle BACK button
    const handleBackClicked = () => {
        if (state.step > 1) {
            setState(prev => ({
                ...prev,
                step: (prev.step - 1) as OnboardingStep,
                mode: 'ASK',
                validationErrors: [],
            }));
        }
    };

    return {
        state,
        handleNextClicked,
        handleBackClicked,
    };
}
