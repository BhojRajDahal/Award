"use client"

import { Navbar } from "@/components/ui/navbar"
import { useTranslation } from "@/lib/i18n-context"
import { Shield, Lock, Eye, FileText, Mail, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PrivacyPolicyPage() {
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
            {t("privacy.title") || "Privacy Policy"}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {t("privacy.organization") || "National Academy of Science and Technology (NAST)"}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {t("privacy.last_updated") || "Last updated"}: {lastUpdated}
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
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("privacy.intro_title") || "Introduction"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.intro_1") ||
                  "The National Academy of Science and Technology (NAST) is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, protect, and share your data when you use our platform."}
              </p>
              <p className="text-base leading-relaxed text-foreground">
                {t("privacy.intro_2") ||
                  "By using our services, you agree to the collection and use of information in accordance with this policy. We take your privacy seriously and are dedicated to maintaining the confidentiality and security of your personal data."}
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("privacy.collect_title") || "Information We Collect"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.collect_intro") ||
                  "We collect the following types of information to provide and improve our services:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  <strong>{t("privacy.collect_name") || "Personal Information"}:</strong>{" "}
                  {t("privacy.collect_name_desc") ||
                    "Name and email address provided during account registration"}
                </li>
                <li>
                  <strong>{t("privacy.collect_auth") || "Authentication Data"}:</strong>{" "}
                  {t("privacy.collect_auth_desc") ||
                    "Encrypted password and session tokens for secure account access"}
                </li>
                <li>
                  <strong>{t("privacy.collect_application") || "Application Data"}:</strong>{" "}
                  {t("privacy.collect_application_desc") ||
                    "Information submitted as part of prize applications, including project proposals, documents, and supporting materials"}
                </li>
                <li>
                  <strong>{t("privacy.collect_logs") || "System Logs"}:</strong>{" "}
                  {t("privacy.collect_logs_desc") ||
                    "Usage data, security logs, and system activity records for platform security and improvement"}
                </li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("privacy.use_title") || "How We Use Information"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.use_intro") ||
                  "We use the collected information for the following purposes:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("privacy.use_account") ||
                    "Account management and user authentication to provide secure access to our platform"}
                </li>
                <li>
                  {t("privacy.use_evaluation") ||
                    "Prize evaluation and assessment by authorized evaluators and administrators"}
                </li>
                <li>
                  {t("privacy.use_security") ||
                    "Platform security monitoring, fraud prevention, and system improvement"}
                </li>
                <li>
                  {t("privacy.use_communication") ||
                    "Communication regarding your applications, account status, and important platform updates"}
                </li>
              </ul>
            </div>
          </section>

          {/* Data Protection & Security */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("privacy.security_title") || "Data Protection & Security"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.security_intro") ||
                  "We implement industry-standard security measures to protect your personal information:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  <strong>{t("privacy.security_encryption") || "Encryption"}:</strong>{" "}
                  {t("privacy.security_encryption_desc") ||
                    "All sensitive data, including passwords, is encrypted using secure encryption protocols"}
                </li>
                <li>
                  <strong>{t("privacy.security_access") || "Restricted Access"}:</strong>{" "}
                  {t("privacy.security_access_desc") ||
                    "Personal information is accessible only to authorized personnel with proper clearance"}
                </li>
                <li>
                  <strong>{t("privacy.security_storage") || "Secure Storage"}:</strong>{" "}
                  {t("privacy.security_storage_desc") ||
                    "Data is stored on secure servers with regular backups and monitoring"}
                </li>
                <li>
                  <strong>{t("privacy.security_monitoring") || "Continuous Monitoring"}:</strong>{" "}
                  {t("privacy.security_monitoring_desc") ||
                    "Our systems are continuously monitored for security threats and unauthorized access attempts"}
                </li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("privacy.sharing_title") || "Data Sharing"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.sharing_intro") ||
                  "We respect your privacy and do not sell, trade, or rent your personal information to third parties."}
              </p>
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.sharing_limited") ||
                  "We may share your information only in the following circumstances:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("privacy.sharing_legal") ||
                    "When required by law, court order, or government regulation"}
                </li>
                <li>
                  {t("privacy.sharing_evaluators") ||
                    "With authorized evaluators and administrators for prize assessment purposes"}
                </li>
                <li>
                  {t("privacy.sharing_protection") ||
                    "To protect the rights, property, or safety of NAST, our users, or others"}
                </li>
              </ul>
            </div>
          </section>

          {/* User Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("privacy.rights_title") || "Your Rights"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.rights_intro") ||
                  "You have the following rights regarding your personal information:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  <strong>{t("privacy.rights_access") || "Access"}:</strong>{" "}
                  {t("privacy.rights_access_desc") ||
                    "You can request access to the personal information we hold about you"}
                </li>
                <li>
                  <strong>{t("privacy.rights_correction") || "Correction"}:</strong>{" "}
                  {t("privacy.rights_correction_desc") ||
                    "You can request correction of any inaccurate or incomplete information"}
                </li>
                <li>
                  <strong>{t("privacy.rights_deletion") || "Deletion"}:</strong>{" "}
                  {t("privacy.rights_deletion_desc") ||
                    "You can request deletion of your account and associated data, subject to legal and operational requirements"}
                </li>
              </ul>
              <p className="text-base leading-relaxed text-foreground mt-4">
                {t("privacy.rights_contact") ||
                  "To exercise these rights, please contact us using the information provided in the Contact section below."}
              </p>
            </div>
          </section>

          {/* Cookies & Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("privacy.cookies_title") || "Cookies & Tracking"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.cookies_intro") ||
                  "We use minimal cookies on our platform, limited to essential functionality:"}
              </p>
              <ul className="space-y-3 text-base leading-relaxed text-foreground list-disc list-inside ml-4">
                <li>
                  {t("privacy.cookies_session") ||
                    "Session cookies to maintain your login state and ensure secure access"}
                </li>
                <li>
                  {t("privacy.cookies_security") ||
                    "Security cookies to protect against unauthorized access and fraud"}
                </li>
              </ul>
              <p className="text-base leading-relaxed text-foreground mt-4">
                {t("privacy.cookies_no_tracking") ||
                  "We do not use tracking cookies, advertising cookies, or any third-party analytics that track your behavior across websites."}
              </p>
            </div>
          </section>

          {/* Policy Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {t("privacy.updates_title") || "Policy Updates"}
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.updates_intro") ||
                  "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements."}
              </p>
              <p className="text-base leading-relaxed text-foreground">
                {t("privacy.updates_notification") ||
                  "When we make significant changes, we will notify you through email or a prominent notice on our platform. The 'Last updated' date at the top of this page indicates when the policy was last revised."}
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">
                {t("privacy.contact_title") || "Contact Information"}
              </h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed text-foreground mb-4">
                {t("privacy.contact_intro") ||
                  "If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:"}
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-base leading-relaxed text-foreground mb-2">
                  <strong>{t("privacy.contact_email") || "Email"}:</strong>{" "}
                  <a
                    href="mailto:info@nast.gov.np"
                    className="text-primary hover:text-primary/80 hover:underline transition-colors"
                  >
                    info@nast.gov.np
                  </a>
                </p>
                <p className="text-base leading-relaxed text-foreground">
                  <strong>{t("privacy.contact_address") || "Address"}:</strong>{" "}
                  {t("privacy.contact_address_value") ||
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
                href="/terms"
                className="hover:text-foreground hover:underline transition-colors"
              >
                {t("privacy.terms_link") || "Terms of Service"}
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

