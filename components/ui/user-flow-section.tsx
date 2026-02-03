"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface UserFlowStep {
  step: string
  description: string
  subSteps?: string[]
}

interface UserFlowSectionProps {
  pageName: string
  description: string
  userFlow: UserFlowStep[]
  bestPractices?: string[]
  roleSpecific?: {
    role: string
    notes: string[]
  }
}

export function UserFlowSection({
  pageName,
  description,
  userFlow,
  bestPractices,
  roleSpecific
}: UserFlowSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="rounded-xl border shadow-sm mt-8 bg-blue-50 border-blue-200">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>User Guide: {pageName}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-blue-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-600" />
          )}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="font-semibold text-sm text-blue-900 mb-2">Purpose</h4>
            <p className="text-sm text-gray-700">{description}</p>
          </div>

          {/* User Flow */}
          <div>
            <h4 className="font-semibold text-sm text-blue-900 mb-3">User Flow</h4>
            <div className="space-y-3">
              {userFlow.map((flow, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm text-gray-900">{flow.step}</h5>
                      <p className="text-sm text-gray-600 mt-1">{flow.description}</p>
                      {flow.subSteps && flow.subSteps.length > 0 && (
                        <ul className="mt-2 ml-4 space-y-1">
                          {flow.subSteps.map((subStep, subIndex) => (
                            <li key={subIndex} className="text-sm text-gray-600 list-disc">
                              {subStep}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          {bestPractices && bestPractices.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Best Practices</h4>
              <ul className="space-y-1 ml-4">
                {bestPractices.map((practice, index) => (
                  <li key={index} className="text-sm text-gray-600 list-disc">
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Role-Specific Notes */}
          {roleSpecific && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-yellow-900 mb-2">
                {roleSpecific.role} Note
              </h4>
              <ul className="space-y-1 ml-4">
                {roleSpecific.notes.map((note, index) => (
                  <li key={index} className="text-sm text-yellow-800 list-disc">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Help Link */}
          <div className="pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-500">
              For complete documentation, see{" "}
              <span className="font-semibold text-blue-600">USER_GUIDE.txt</span> in the project root.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
