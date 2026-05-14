/**
 * Seed Tanzanian legal review workflow templates.
 *
 * Run with:
 *   npx tsx src/scripts/seedWorkflows.ts
 *
 * Idempotent — skips any workflow whose title already exists as is_system=true.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
);

interface ColumnConfig {
    index: number;
    name: string;
    prompt: string;
    format?: string;
    tags?: string[];
}

interface WorkflowSeed {
    title: string;
    practice: string;
    columns_config: ColumnConfig[];
}

const WORKFLOWS: WorkflowSeed[] = [
    {
        title: "Employment Contract Review",
        practice: "Employment",
        columns_config: [
            {
                index: 0,
                name: "Parties",
                prompt:
                    "Identify the employer and employee named in this contract, including any registered business names and addresses.",
                format: "text",
            },
            {
                index: 1,
                name: "Contract Duration",
                prompt:
                    "What is the duration or term of employment? State whether fixed-term or indefinite, and the start/end dates if specified.",
                format: "text",
            },
            {
                index: 2,
                name: "Termination Clause",
                prompt:
                    "Summarise the termination provisions. Does the notice period meet the minimum required under the Employment and Labour Relations Act 2004 (Tanzania)? The Act requires at least 28 days notice (or pay in lieu) for employees with more than 1 month of service. Flag red if the notice period is shorter than the statutory minimum or if a reason for termination is not required.",
                format: "text",
            },
            {
                index: 3,
                name: "Notice Period",
                prompt:
                    "What is the required notice period for termination by either party? State the number of days or weeks.",
                format: "text",
            },
            {
                index: 4,
                name: "Non-Compete / Restraint of Trade",
                prompt:
                    "Is there a non-compete, non-solicitation, or restraint of trade clause? If yes, summarise its scope (duration, geography, activities restricted). Under Tanzanian law, restraint of trade clauses must be reasonable in scope to be enforceable. Flag yellow if the clause appears overly broad.",
                format: "yes_no",
            },
            {
                index: 5,
                name: "Probation Period",
                prompt:
                    "Is there a probation period? If yes, state its duration. Under the Employment and Labour Relations Act 2004, probation must not exceed 12 months. Flag red if it exceeds this limit.",
                format: "text",
            },
            {
                index: 6,
                name: "Governing Law",
                prompt:
                    "Which law governs this contract and which courts have jurisdiction? Flag yellow if not Tanzanian law for a contract relating to Tanzania-based employment.",
                format: "text",
            },
        ],
    },
    {
        title: "Share Purchase Agreement Review",
        practice: "Corporate",
        columns_config: [
            {
                index: 0,
                name: "Parties",
                prompt:
                    "Identify the seller(s), buyer(s), and the target company. Include registered names and incorporation details if stated.",
                format: "text",
            },
            {
                index: 1,
                name: "Purchase Price",
                prompt:
                    "What is the purchase price for the shares? Include the currency, total amount, and any adjustment mechanisms (earn-out, escrow, deferred consideration).",
                format: "text",
            },
            {
                index: 2,
                name: "Shares Being Sold",
                prompt:
                    "How many shares are being sold and what percentage of the total issued share capital do they represent?",
                format: "text",
            },
            {
                index: 3,
                name: "Conditions Precedent",
                prompt:
                    "List all conditions precedent (CPs) that must be satisfied before completion. Include regulatory approvals (e.g. Fair Competition Commission of Tanzania), shareholder approvals, and third-party consents.",
                format: "bulleted_list",
            },
            {
                index: 4,
                name: "Material Adverse Change (MAC) Clause",
                prompt:
                    "Is there a Material Adverse Change or Material Adverse Effect clause? If yes, summarise what constitutes a MAC and what right it triggers (e.g. right to walk away).",
                format: "yes_no",
            },
            {
                index: 5,
                name: "Warranties",
                prompt:
                    "Summarise the key seller warranties. Are there any warranties specifically relating to Tanzanian regulatory compliance, tax, or land rights? Flag yellow if standard warranties appear absent or unusually limited.",
                format: "text",
            },
            {
                index: 6,
                name: "Completion Date",
                prompt:
                    "What is the longstop date or target completion date? Is there a mechanism if completion does not occur by that date?",
                format: "date",
            },
            {
                index: 7,
                name: "Governing Law",
                prompt:
                    "Which law governs this agreement and which courts or arbitral tribunal has jurisdiction? Flag yellow if not Tanzanian law for a transaction involving a Tanzanian company.",
                format: "text",
            },
        ],
    },
    {
        title: "Loan Agreement Review",
        practice: "Finance",
        columns_config: [
            {
                index: 0,
                name: "Borrower & Lender",
                prompt:
                    "Identify the borrower(s) and lender(s), including any guarantors or security providers.",
                format: "text",
            },
            {
                index: 1,
                name: "Principal Amount",
                prompt:
                    "What is the principal loan amount? State the currency and any tranching if applicable.",
                format: "monetary_amount",
            },
            {
                index: 2,
                name: "Interest Rate",
                prompt:
                    "What is the interest rate? State whether fixed or floating, the benchmark rate (if floating), and the margin. Note if the rate may breach the Bank of Tanzania's guidelines on maximum lending rates.",
                format: "text",
            },
            {
                index: 3,
                name: "Repayment Terms",
                prompt:
                    "How and when is the loan repaid? Summarise the repayment schedule, bullet repayment date, or amortisation profile.",
                format: "text",
            },
            {
                index: 4,
                name: "Security",
                prompt:
                    "What security is provided (e.g. mortgage, debenture, pledge, guarantee)? Does the security include Tanzanian land or assets that require registration with the Business Registrations and Licensing Agency (BRELA) or the Land Registry?",
                format: "text",
            },
            {
                index: 5,
                name: "Events of Default",
                prompt:
                    "List the events of default. Are there any cross-default provisions? Flag yellow if any event of default appears unusually broad or could be triggered by minor technical breaches.",
                format: "bulleted_list",
            },
            {
                index: 6,
                name: "Governing Law",
                prompt:
                    "Which law governs this agreement? Flag yellow if not Tanzanian law for a loan to a Tanzania-domiciled borrower without a clear cross-border rationale.",
                format: "text",
            },
        ],
    },
    {
        title: "Court Pleading Review",
        practice: "Litigation",
        columns_config: [
            {
                index: 0,
                name: "Court & Division",
                prompt:
                    "Identify the court (e.g. High Court of Tanzania, District Court, Court of Appeal), the division (e.g. Commercial, Land, Labour), and the registry location.",
                format: "text",
            },
            {
                index: 1,
                name: "Case Number & Date",
                prompt: "What is the case number and the date of filing?",
                format: "text",
            },
            {
                index: 2,
                name: "Parties",
                prompt:
                    "Identify all plaintiffs/applicants and defendants/respondents, including their described capacity (e.g. company, individual, government body).",
                format: "text",
            },
            {
                index: 3,
                name: "Cause of Action",
                prompt:
                    "What is the cause of action or ground of the claim? Identify the legal basis (contractual, tortious, statutory, constitutional, etc.) and the key facts pleaded in support.",
                format: "text",
            },
            {
                index: 4,
                name: "Relief Sought",
                prompt:
                    "What relief is being sought? List all prayers, including damages (and quantum if stated), injunctions, declarations, costs, and any other specific orders.",
                format: "bulleted_list",
            },
            {
                index: 5,
                name: "Limitation Issue",
                prompt:
                    "Does the pleading disclose when the cause of action arose? Is there a potential limitation period issue? Under the Limitation Act (Tanzania), most civil claims must be brought within 3 years. Flag red if the claim appears to be time-barred or if the date of the cause of action is not pleaded.",
                format: "yes_no",
            },
            {
                index: 6,
                name: "Procedural Compliance",
                prompt:
                    "Does the pleading appear to comply with the Civil Procedure Code (Tanzania)? Check for: proper verification/jurat, correct format for the type of suit, adequate particulars of claim. Flag yellow for any missing procedural element.",
                format: "tag",
                tags: ["Compliant", "Minor Issues", "Major Issues", "Unknown"],
            },
        ],
    },
];

async function seed() {
    console.log("Seeding Tanzanian legal workflow templates…");

    for (const wf of WORKFLOWS) {
        // Check if already exists
        const { data: existing } = await supabase
            .from("workflows")
            .select("id, title")
            .eq("title", wf.title)
            .eq("is_system", true)
            .maybeSingle();

        if (existing) {
            console.log(`  ⏭  Skipping "${wf.title}" (already exists)`);
            continue;
        }

        const { error } = await supabase.from("workflows").insert({
            user_id: null,
            title: wf.title,
            type: "tabular",
            practice: wf.practice,
            columns_config: wf.columns_config,
            is_system: true,
        });

        if (error) {
            console.error(`  ✗  Failed to insert "${wf.title}":`, error.message);
        } else {
            console.log(`  ✓  Inserted "${wf.title}"`);
        }
    }

    console.log("Done.");
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
