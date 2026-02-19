"use client";

import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { B2APlanner } from "@/components/planning/B2APlanner";
import { motion } from "framer-motion";

export default function RMPlanningPage() {
    return (
        <ConsoleLayout hideContextPanel>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Client Wealth Planner
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Visualize "Point A to Point B" trajectories for your clients.
                        </p>
                    </div>

                    <B2APlanner
                        initialData={{
                            currentWealth: 5000000,
                            targetWealth: 20000000,
                            riskProfile: 'moderate'
                        }}
                    />
                </motion.div>
            </div>
        </ConsoleLayout>
    );
}
