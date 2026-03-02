import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Settings as SettingsIcon,
  HelpCircle,
  Mail,
  MessageSquare,
  Book,
  ExternalLink,
  Github,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("help");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Ticket submitted successfully! Our support team will get back to you soon.");
      setTicketSubject("");
      setTicketDescription("");
      setIsSubmitting(false);
    }, 1500);
  };

  const faqs = [
    {
      question: "How do I configure the voice agent?",
      answer: "Navigate to the 'Agents' page and click on 'Agent Configuration'. You can edit the system prompt, select LLM/STT/TTS providers, configure voice settings, and enable/disable tools. All changes create a new configuration version for audit purposes."
    },
    {
      question: "What providers are supported?",
      answer: "AgnoX supports multiple providers for each service: LLM (OpenAI, Anthropic, Google), STT (Deepgram, AssemblyAI, Google), and TTS (ElevenLabs, OpenAI, Google, Azure). The available providers are configured in your whitelist and can be selected in the agent configuration."
    },
    {
      question: "How do I monitor active calls?",
      answer: "Go to the 'Rooms' page to see all active voice sessions in real-time. You can view participant counts, room details, and end calls if needed. The page auto-refreshes every 15 seconds to show the latest status."
    },
    {
      question: "Where can I see call history?",
      answer: "The 'Sessions' page shows all completed and active calls with details like duration, participants, and timestamps. You can search and filter sessions to find specific calls."
    },
    {
      question: "How do I enable or disable tools?",
      answer: "In the Agent Configuration page, scroll to the 'Function Tools' section. Each tool has a toggle switch that you can use to enable or disable it. Tools are categorized by risk level (low, medium, high) to help you make informed decisions."
    },
    {
      question: "What is the difference between rooms and sessions?",
      answer: "In LiveKit, every session is a room. 'Rooms' shows currently active calls, while 'Sessions' shows the complete history of all calls including those that have ended."
    },
    {
      question: "How do I configure SIP trunks?",
      answer: "SIP trunk configuration is managed through the LiveKit server configuration. You can view existing trunks and dispatch rules in the 'SIP' page. Contact your system administrator to add or modify SIP trunks."
    },
    {
      question: "Can I record calls?",
      answer: "Yes! Call recording is automatically enabled for agent calls. Recordings are stored according to your egress configuration (local storage or cloud). You can view and manage recordings in the 'Egress' page."
    },
    {
      question: "How do I test the agent before deploying changes?",
      answer: "Use the 'Test Agent' button on the Agent Configuration page to preview the agent with your current configuration without creating a new version. This allows you to test changes before saving them."
    },
    {
      question: "What happens when I update the agent configuration?",
      answer: "When you save changes, a new configuration version is created. The system maintains version history and audit logs of all changes. Active calls continue using their original configuration, while new calls use the updated version."
    },
  ];

  return (
    <DashboardLayout title="Settings">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="help">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help & Support
          </TabsTrigger>
          <TabsTrigger value="faq">
            <Book className="w-4 h-4 mr-2" />
            FAQ
          </TabsTrigger>
        </TabsList>

        {/* Help & Support Tab */}
        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>
                Get assistance with AgnoX V1 voice agent platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Support */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Email Support</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Get help via email at <a href="mailto:support@agnoshin.com" className="text-primary hover:underline">support@agnoshin.com</a> within 24 hours
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <a href="mailto:support@agnoshin.com">
                              Email Us
                              <Mail className="w-3 h-3 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Community Forum</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Ask questions and share knowledge
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <a href="https://community.agnox.ai" target="_blank" rel="noopener noreferrer">
                              Visit Forum
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Ticketing System */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Submit a Ticket</h3>
                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                        <Input
                          id="subject"
                          placeholder="What do you need help with?"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <Textarea
                          id="description"
                          placeholder="Please provide as much detail as possible..."
                          className="min-h-[120px]"
                          value={ticketDescription}
                          onChange={(e) => setTicketDescription(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Ticket"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about AgnoX V1 voice agent platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </DashboardLayout>
  );
}
