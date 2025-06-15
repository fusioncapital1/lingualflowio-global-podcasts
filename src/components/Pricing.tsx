
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { useState } from "react";
import AuthModal from "./auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Pricing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const plans = [
    {
      name: "Starter",
      price: "$19",
      period: "/month",
      yearlyPrice: "$190",
      description: "Perfect for new podcasters",
      features: [
        "5 episodes per month",
        "3 languages included",
        "Basic transcription",
        "Email support",
        "720p video export",
        "14-day free trial"
      ],
      buttonText: "Start Free Trial",
      popular: false,
      stripePriceId: "price_starter_monthly" // We'll set this up
    },
    {
      name: "Professional",
      price: "$49",
      period: "/month",
      yearlyPrice: "$490",
      description: "For growing podcast networks",
      features: [
        "25 episodes per month",
        "15 languages included",
        "Advanced transcription",
        "Priority support",
        "1080p video export",
        "Voice cloning ($19/episode)",
        "Custom branding",
        "Analytics dashboard"
      ],
      buttonText: "Start Free Trial",
      popular: true,
      stripePriceId: "price_professional_monthly"
    },
    {
      name: "Enterprise",
      price: "$149",
      period: "/month",
      yearlyPrice: "$1490",
      description: "For podcast networks & agencies",
      features: [
        "Unlimited episodes",
        "All 30+ languages",
        "Premium transcription",
        "24/7 phone support",
        "4K video export",
        "Voice cloning included",
        "White-label solution",
        "API access",
        "Dedicated account manager"
      ],
      buttonText: "Contact Sales",
      popular: false,
      stripePriceId: "price_enterprise_monthly"
    }
  ];

  const handlePlanSelect = (plan: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (plan.name === "Enterprise") {
      // For enterprise, redirect to contact form or calendar
      window.open("mailto:sales@linguaflow.com?subject=Enterprise Plan Inquiry", "_blank");
      return;
    }
    
    // For other plans, we'll implement Stripe checkout
    // TODO: Implement Stripe checkout
    console.log("Selected plan:", plan.name);
  };

  return (
    <>
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your podcast. All plans include a 14-day free trial.
            </p>
            <div className="mt-6 text-sm text-gray-500">
              💡 Save 20% with annual billing • No setup fees • Cancel anytime
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-2 border-purple-500 shadow-lg scale-105' 
                  : 'border border-purple-100'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 text-lg">{plan.period}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    or {plan.yearlyPrice}/year (save 20%)
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="bg-green-100 rounded-full p-1 mr-3">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3 text-lg font-semibold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                        : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
            <p className="text-sm text-gray-500">
              Need a custom solution? <a href="mailto:sales@linguaflow.com" className="text-purple-600 hover:underline">Contact our sales team</a>
            </p>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Pricing;
