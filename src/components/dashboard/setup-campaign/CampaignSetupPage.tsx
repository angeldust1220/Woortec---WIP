'use client';

import React, { useEffect, useState } from 'react';
import StrategyCard from '@/components/dashboard/setup-campaign/StrategyCard';
import AdCreativePage from '@/components/dashboard/setup-campaign/AdCreativePage';
import CampaignNamePage from '@/components/dashboard/setup-campaign/CampaignNamePage';
import StrategyConfirmation from '@/components/dashboard/setup-campaign/StrategyConfirmation';
import StrategyCreationProgress from '@/components/dashboard/setup-campaign/StrategyCreationProgress';
import { createClient } from '../../../../utils/supabase/client'; // Supabase client

const CampaignSetupPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1); // Control step navigation
  const [planOutput, setPlanOutput] = useState<any[]>([]); // Store campaign strategies
  const [imageFile, setImageFile] = useState<File | null>(null); // Store uploaded image
  const [campaignData, setCampaignData] = useState<{ campaignName: string; labelOne: string; labelTwo: string } | null>(null); // Store campaign name & labels
  const [loading, setLoading] = useState<boolean>(true);
  const [campaignId, setCampaignId] = useState<string | null>(null); // Store campaign ID

  // Fetch the campaign strategy data stored in Supabase
  const fetchPlanOutput = async () => {
    try {
      const supabase = createClient();
      const user_id = localStorage.getItem('userid');

      if (user_id) {
        const { data, error } = await supabase
          .from('facebook_campaign_data')
          .select('strategy_data')
          .eq('user_id', user_id)
          .single(); // Fetch stored plan output

        if (error) {
          console.error('Error fetching plan output:', error);
        } else {
          setPlanOutput(data?.strategy_data || []);
        }
      } else {
        console.error('User ID not found in localStorage');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch required data when the component mounts
  useEffect(() => {
    fetchPlanOutput();
  }, []);

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);

  const handleCampaignCreationSuccess = (createdCampaignId: string | null) => {
    if (createdCampaignId) {
      setCampaignId(createdCampaignId);
      handleNextStep(); // Move to the next step (confirmation)
    } else {
      console.error('Campaign creation failed, no campaign ID provided.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        {currentStep === 1 && (
          <StrategyCard onNext={handleNextStep} />
        )}
        {currentStep === 2 && (
          <AdCreativePage
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            setImageFile={setImageFile} // Pass the function to set the image file
          />
        )}
        {currentStep === 3 && (
          <CampaignNamePage
            onNext={handleNextStep}
            onBack={handlePreviousStep}
            setCampaignData={setCampaignData} // Pass the function to set the campaign name & labels
          />
        )}
        {currentStep === 4 && (
          <StrategyCreationProgress
            planOutput={planOutput} // Pass the planOutput data
            imageFile={imageFile} // Pass the uploaded image file
            campaignData={campaignData} // Pass the campaign name and labels
            onNext={handleCampaignCreationSuccess} // Move to the next step when done
          />
        )}
        {currentStep === 5 && (
          <StrategyConfirmation campaignId={campaignId} />
        )}
      </div>
    </div>
  );
};

export default CampaignSetupPage;
