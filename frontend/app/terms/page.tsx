"use client"

import { Navbar } from "@/components/ui/navbar"
import { useTranslation } from "@/lib/i18n-context"
import { FileText, Shield, Lock, AlertTriangle, Scale, Mail, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function TermsPage() {
  const { t, language } = useTranslation()
  const isNepali = language === "ne"

  const lastUpdated = "January 15, 2025"

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-slate-800 p-2 shadow-md">
              <Image
                src="/Nepal_Academy_of_Science_and_Technology_Logo.svg.png"
                alt="NAST Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            {t("terms.title") || "Terms & Conditions"}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {t("terms.organization") || "National Academy of Science and Technology (NAST)"}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t("terms.last_updated") || "Last updated"}: {lastUpdated}
            </span>
          </div>
        </div>

        {/* Content Card */}
        <div
          className={cn(
            "bg-card rounded-lg shadow-xl border-0 p-6 sm:p-8 md:p-10",
            "animate-in fade-in-0 zoom-in-95 duration-200"
          )}
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Introduction */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("terms.intro_title") || "Introduction"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.intro_1") ||
                  "These Terms & Conditions ('Terms') govern your access to and use of the National Academy of Science and Technology (NAST) platform. By accessing or using our services, you agree to be bound by these Terms."}
              </p>
              <p className="text-base leading-relaxed text-foreground">
                {t("terms.intro_2") ||
                  "If you do not agree to these Terms, you must not use our platform. We reserve the right to modify these Terms at any time, and your continued use of the platform constitutes acceptance of any such modifications."}
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("terms.eligibility_title") || "Eligibility"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.eligibility_intro") ||
                  "Our platform is intended for authorized users only. To use our services, you must:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("terms.eligibility_age") ||
                    "Be of legal age to enter into binding agreements in your jurisdiction"}
                </li>
                <li>
                  {t("terms.eligibility_authorized") ||
                    "Be an authorized user with a valid account registered with NAST"}
                </li>
                <li>
                  {t("terms.eligibility_compliance") ||
                    "Comply with all applicable laws and regulations"}
                </li>
              </ul>
              <p className="text-base leading-relaxed text-foreground mt-4">
                {t("terms.eligibility_responsibility") ||
                  "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."}
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("terms.responsibilities_title") || "User Responsibilities"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.responsibilities_intro") ||
                  "As a user of our platform, you agree to:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  <strong>{t("terms.responsibilities_accurate") || "Provide Accurate Information"}:</strong>{" "}
                  {t("terms.responsibilities_accurate_desc") ||
                    "Supply accurate, current, and complete information during registration and when submitting applications"}
                </li>
                <li>
                  <strong>{t("terms.responsibilities_lawful") || "Lawful Use"}:</strong>{" "}
                  {t("terms.responsibilities_lawful_desc") ||
                    "Use the platform only for lawful purposes and in accordance with these Terms"}
                </li>
                <li>
                  <strong>{t("terms.responsibilities_no_misuse") || "No Misuse"}:</strong>{" "}
                  {t("terms.responsibilities_no_misuse_desc") ||
                    "Not engage in any activity that disrupts, damages, or interferes with the platform or its services"}
                </li>
                <li>
                  <strong>{t("terms.responsibilities_no_unauthorized") || "No Unauthorized Access"}:</strong>{" "}
                  {t("terms.responsibilities_no_unauthorized_desc") ||
                    "Not attempt to gain unauthorized access to any part of the platform, other accounts, or computer systems"}
                </li>
              </ul>
            </div>
          </section>

          {/* Account Security */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("terms.security_title") || "Account Security"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.security_intro") ||
                  "You are solely responsible for maintaining the security of your account:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("terms.security_credentials") ||
                    "Keep your login credentials (email and password) confidential and secure"}
                </li>
                <li>
                  {t("terms.security_report") ||
                    "Immediately notify NAST if you suspect any unauthorized access to your account"}
                </li>
                <li>
                  {t("terms.security_activities") ||
                    "You are responsible for all activities that occur under your account, whether authorized by you or not"}
                </li>
              </ul>
              <p className="text-base leading-relaxed text-foreground mt-4">
                {t("terms.security_liability") ||
                  "NAST is not liable for any loss or damage arising from your failure to maintain the security of your account."}
              </p>
            </div>
          </section>

          {/* Prize Applications */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("terms.applications_title") || "Prize Applications"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.applications_intro") ||
                  "When submitting prize applications through our platform:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("terms.applications_submission") ||
                    "All submissions must be made in accordance with the specified guidelines and deadlines"}
                </li>
                <li>
                  {t("terms.applications_evaluation") ||
                    "Applications will be evaluated by authorized evaluators based on established criteria"}
                </li>
                <li>
                  {t("terms.applications_finality") ||
                    "All evaluation decisions are final and binding. NAST reserves the right to accept or reject any application at its sole discretion"}
                </li>
                <li>
                  {t("terms.applications_originality") ||
                    "You warrant that all submitted materials are original, do not infringe on any third-party rights, and are submitted in good faith"}
                </li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("terms.ip_title") || "Intellectual Property"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                <strong>{t("terms.ip_platform") || "Platform Content"}:</strong>{" "}
                {t("terms.ip_platform_desc") ||
                  "All content on this platform, including but not limited to text, graphics, logos, and software, is the property of NAST and is protected by copyright and other intellectual property laws."}
              </p>
              <p className="text-base leading-relaxed text-foreground mb-4">
                <strong>{t("terms.ip_user_content") || "User-Submitted Content"}:</strong>{" "}
                {t("terms.ip_user_content_desc") ||
                  "By submitting content to our platform, you grant NAST a non-exclusive, royalty-free license to use, reproduce, and display such content for the purposes of prize evaluation and platform operation."}
              </p>
              <p className="text-base leading-relaxed text-foreground">
                {t("terms.ip_retention") ||
                  "You retain ownership of your submitted content but acknowledge that NAST may retain copies for record-keeping and legal compliance purposes."}
              </p>
            </div>
          </section>

          {/* Privacy Reference */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("terms.privacy_title") || "Privacy"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground">
                {t("terms.privacy_intro") ||
                  "Your use of our platform is also governed by our Privacy Policy. Please review our "}
                <Link
                  href="/privacy"
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  {t("terms.privacy_link") || "Privacy Policy"}
                </Link>
                {t("terms.privacy_end") || " to understand how we collect, use, and protect your personal information."}
              </p>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("terms.termination_title") || "Termination"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.termination_intro") ||
                  "NAST reserves the right to suspend or terminate your account and access to the platform at any time, with or without notice, for any reason, including but not limited to:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("terms.termination_violation") ||
                    "Violation of these Terms or any applicable laws or regulations"}
                </li>
                <li>
                  {t("terms.termination_fraud") ||
                    "Fraudulent, abusive, or illegal activity"}
                </li>
                <li>
                  {t("terms.termination_inactivity") ||
                    "Extended periods of account inactivity"}
                </li>
                <li>
                  {t("terms.termination_request") ||
                    "At your request"}
                </li>
              </ul>
              <p className="text-base leading-relaxed text-foreground mt-4">
                {t("terms.termination_effect") ||
                  "Upon termination, your right to use the platform will immediately cease, and we may delete your account and associated data in accordance with our data retention policies."}
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("terms.liability_title") || "Limitation of Liability"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.liability_intro") ||
                  "The platform is provided 'as-is' and 'as-available' without warranties of any kind, either express or implied."}
              </p>
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.liability_no_guarantee") ||
                  "NAST does not guarantee that:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("terms.liability_availability") ||
                    "The platform will be available at all times or free from errors or interruptions"}
                </li>
                <li>
                  {t("terms.liability_accuracy") ||
                    "All information on the platform is accurate, complete, or current"}
                </li>
                <li>
                  {t("terms.liability_security") ||
                    "The platform is completely secure or free from viruses or other harmful components"}
                </li>
              </ul>
              <p className="text-base leading-relaxed text-foreground mt-4">
                {t("terms.liability_limit") ||
                  "To the maximum extent permitted by law, NAST shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform."}
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("terms.changes_title") || "Changes to Terms"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.changes_intro") ||
                  "NAST reserves the right to modify, update, or replace these Terms at any time. We will notify users of any material changes through:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("terms.changes_email") ||
                    "Email notification to registered users"}
                </li>
                <li>
                  {t("terms.changes_notice") ||
                    "A prominent notice on the platform"}
                </li>
                <li>
                  {t("terms.changes_date") ||
                    "Updating the 'Last updated' date at the top of this page"}
                </li>
              </ul>
              <p className="text-base leading-relaxed text-foreground mt-4">
                {t("terms.changes_continuation") ||
                  "Your continued use of the platform after any changes constitutes acceptance of the modified Terms."}
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("terms.governing_title") || "Governing Law"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground">
                {t("terms.governing_intro") ||
                  "These Terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising from or relating to these Terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Nepal."}
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("terms.contact_title") || "Contact Information"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("terms.contact_intro") ||
                  "If you have any questions, concerns, or requests regarding these Terms & Conditions, please contact us:"}
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-base leading-relaxed text-foreground mb-2">
                  <strong>{t("terms.contact_email") || "Email"}:</strong>{" "}
                  <a
                    href="mailto:info@nast.gov.np"
                    className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    info@nast.gov.np
                  </a>
                </p>
                <p className="text-base leading-relaxed text-foreground">
                  <strong>{t("terms.contact_address") || "Address"}:</strong>{" "}
                  {t("terms.contact_address_value") ||
                    "Khumaltar, Lalitpur, Nepal | PO Box: 3323"}
                </p>
              </div>
            </div>
          </section>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <Link
                href="/"
                className="hover:text-foreground hover:underline transition-colors"
              >
                {t("nav.home") || "Home"}
              </Link>
              <span aria-hidden="true">•</span>
              <Link
                href="/privacy"
                className="hover:text-foreground hover:underline transition-colors"
              >
                {t("footer.privacy") || "Privacy Policy"}
              </Link>
              <span aria-hidden="true">•</span>
              <Link
                href="/contact"
                className="hover:text-foreground hover:underline transition-colors"
              >
                {t("nav.contact") || "Contact"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
