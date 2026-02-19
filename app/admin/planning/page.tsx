"use client";

import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { B2APlanner } from "@/components/planning/B2APlanner";
import { motion } from "framer-motion";

export default function AdminPlanningPage() {
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
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Financial Planning (B2A)
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            Create and simulate wealth acceleration plans for clients.
                        </p>
                    </div>

                    <B2APlanner
                        initialData={{
                            currentWealth: 10000000,
                            targetWealth: 50000000,
                            riskProfile: 'aggressive'
                        }}
                    />
                </motion.div>
            </div>
        </ConsoleLayout>
    );
}
