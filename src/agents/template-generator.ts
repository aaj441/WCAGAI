/**
 * Template Generator Agent
 * 
 * Generates FDCPA-compliant debt collection templates with variable substitution.
 * Ensures all generated documents meet legal compliance requirements.
 */

import type { 
  Template, 
  TemplateVariables, 
  GeneratedDocument,
  FDCPAValidation 
} from '@/types/agents';

export class TemplateGeneratorAgent {
  private templates: Map<string, Template> = new Map();
  
  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default FDCPA-compliant templates
   */
  private initializeDefaultTemplates(): void {
    // Initial Collection Notice Template (FDCPA § 809)
    this.templates.set('initial_notice', {
      id: 'initial_notice',
      name: 'Initial Collection Notice',
      category: 'debt_validation',
      fdcpaSection: '§ 809',
      content: `
Dear {{debtor_name}},

This is an attempt to collect a debt, and any information obtained will be used for that purpose.

Debt Information:
- Creditor: {{creditor_name}}
- Original Amount: ${{debt_amount}}
- Current Balance: ${{current_balance}}
- Date of Last Payment: {{last_payment_date}}
- Account Number: {{account_number}}

NOTICE: Unless you notify this office within 30 days after receiving this notice that you dispute the validity of this debt or any portion thereof, this office will assume this debt is valid. If you notify this office in writing within 30 days after receiving this notice that you dispute the validity of this debt or any portion thereof, this office will obtain verification of the debt or obtain a copy of a judgment and mail you a copy of such judgment or verification. If you request this office in writing within 30 days after receiving this notice this office will provide you with the name and address of the original creditor, if different from the current creditor.

Payment Options:
{{payment_options}}

Questions? Contact us at:
{{agency_name}}
{{agency_address}}
{{agency_phone}}
{{agency_email}}

This communication is from a debt collector.

Sincerely,
{{collector_name}}
{{collector_title}}
`,
      variables: {
        debtor_name: { type: 'string', required: true, validation: /^[A-Za-z\s'-]+$/ },
        creditor_name: { type: 'string', required: true },
        debt_amount: { type: 'currency', required: true, min: 0 },
        current_balance: { type: 'currency', required: true, min: 0 },
        last_payment_date: { type: 'date', required: true },
        account_number: { type: 'string', required: true, mask: true },
        payment_options: { type: 'text', required: true },
        agency_name: { type: 'string', required: true },
        agency_address: { type: 'address', required: true },
        agency_phone: { type: 'phone', required: true },
        agency_email: { type: 'email', required: true },
        collector_name: { type: 'string', required: true },
        collector_title: { type: 'string', required: true },
      },
      complianceRules: [
        'MUST include 30-day validation notice',
        'MUST identify as debt collection communication',
        'MUST provide creditor information',
        'MUST include debt amount',
        'MUST include dispute rights',
        'MUST NOT be deceptive or misleading',
        'MUST NOT threaten illegal action',
        'MUST NOT use profane language',
      ],
      createdAt: new Date(),
      version: '1.0',
    });

    // Validation Notice Template
    this.templates.set('validation_notice', {
      id: 'validation_notice',
      name: 'Debt Validation Notice',
      category: 'validation_response',
      fdcpaSection: '§ 809(b)',
      content: `
Dear {{debtor_name}},

Re: Account #{{account_number}}

This letter is in response to your request for validation of the debt referenced above.

Please find enclosed the following validation documents:
{{validation_documents}}

Debt Details:
- Original Creditor: {{creditor_name}}
- Date of Default: {{default_date}}
- Original Balance: ${{original_amount}}
- Current Balance: ${{current_balance}}
- Interest Rate: {{interest_rate}}%
- Late Fees: ${{late_fees}}

Documentation Enclosed:
1. Copy of original credit agreement
2. Account statement history
3. Chain of title documentation
4. Itemization of claimed balance

If you have any questions about this validation, please contact us within 30 days.

{{agency_name}}
{{agency_address}}
{{agency_phone}}
`,
      variables: {
        debtor_name: { type: 'string', required: true },
        account_number: { type: 'string', required: true, mask: true },
        validation_documents: { type: 'text', required: true },
        creditor_name: { type: 'string', required: true },
        default_date: { type: 'date', required: true },
        original_amount: { type: 'currency', required: true },
        current_balance: { type: 'currency', required: true },
        interest_rate: { type: 'number', required: true, min: 0, max: 100 },
        late_fees: { type: 'currency', required: true, min: 0 },
        agency_name: { type: 'string', required: true },
        agency_address: { type: 'address', required: true },
        agency_phone: { type: 'phone', required: true },
      },
      complianceRules: [
        'MUST provide verification within 30 days',
        'MUST cease collection until verification provided',
        'MUST include all requested documentation',
        'MUST show chain of custody',
      ],
      createdAt: new Date(),
      version: '1.0',
    });

    // Settlement Offer Template
    this.templates.set('settlement_offer', {
      id: 'settlement_offer',
      name: 'Settlement Offer Letter',
      category: 'settlement',
      fdcpaSection: '§ 807',
      content: `
Dear {{debtor_name}},

Re: Settlement Offer - Account #{{account_number}}

We are authorized to offer you a settlement on the above-referenced account.

Current Balance: ${{current_balance}}
Settlement Offer: ${{settlement_amount}} ({{settlement_percentage}}% of balance)
Offer Valid Until: {{offer_expiration_date}}

Payment Terms:
{{payment_terms}}

If you accept this settlement offer:
1. Payment must be received by {{offer_expiration_date}}
2. Upon receipt of payment, the account will be marked "Settled in Full"
3. No further collection action will be taken
4. This settlement is reported to credit bureaus as agreed

To accept this offer, please contact us at {{agency_phone}} or reply to this letter.

This is a settlement offer. Any information obtained will be used for that purpose.

{{agency_name}}
{{agency_address}}
`,
      variables: {
        debtor_name: { type: 'string', required: true },
        account_number: { type: 'string', required: true, mask: true },
        current_balance: { type: 'currency', required: true },
        settlement_amount: { type: 'currency', required: true },
        settlement_percentage: { type: 'number', required: true, min: 1, max: 100 },
        offer_expiration_date: { type: 'date', required: true },
        payment_terms: { type: 'text', required: true },
        agency_phone: { type: 'phone', required: true },
        agency_name: { type: 'string', required: true },
        agency_address: { type: 'address', required: true },
      },
      complianceRules: [
        'MUST clearly state settlement terms',
        'MUST include expiration date',
        'MUST NOT be coercive',
        'MUST explain credit reporting impact',
        'MUST allow reasonable time to respond',
      ],
      createdAt: new Date(),
      version: '1.0',
    });
  }

  /**
   * Generate a document from template
   */
  async generateDocument(
    templateId: string,
    variables: TemplateVariables
  ): Promise<GeneratedDocument> {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate variables
    const validation = this.validateVariables(template, variables);
    if (!validation.isValid) {
      throw new Error(`Variable validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate FDCPA compliance
    const complianceCheck = this.validateFDCPACompliance(template, variables);
    if (!complianceCheck.isCompliant) {
      throw new Error(`FDCPA compliance failed: ${complianceCheck.violations.join(', ')}`);
    }

    // Substitute variables
    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      const varDef = template.variables[key];
      const formattedValue = this.formatVariable(value, varDef);
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), formattedValue);
    }

    return {
      id: `doc_${Date.now()}`,
      templateId,
      templateName: template.name,
      content,
      variables,
      generatedAt: new Date(),
      validated: complianceCheck.isCompliant,
      complianceChecks: complianceCheck,
    };
  }

  /**
   * Bulk generate documents
   */
  async bulkGenerate(
    templateId: string,
    variablesList: TemplateVariables[]
  ): Promise<GeneratedDocument[]> {
    console.log(`[Template Generator] Bulk generating ${variablesList.length} documents`);
    
    const documents: GeneratedDocument[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < variablesList.length; i++) {
      try {
        const doc = await this.generateDocument(templateId, variablesList[i]);
        documents.push(doc);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`[Template Generator] ${errors.length} documents failed to generate:`, errors);
    }

    return documents;
  }

  /**
   * Validate template variables
   */
  private validateVariables(template: Template, variables: TemplateVariables): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required variables
    for (const [key, varDef] of Object.entries(template.variables)) {
      if (varDef.required && !variables[key]) {
        errors.push(`Missing required variable: ${key}`);
      }

      // Type validation
      if (variables[key]) {
        const value = variables[key];
        
        if (varDef.type === 'email' && !this.isValidEmail(value)) {
          errors.push(`Invalid email format: ${key}`);
        }
        
        if (varDef.type === 'phone' && !this.isValidPhone(value)) {
          errors.push(`Invalid phone format: ${key}`);
        }

        if (varDef.type === 'currency' && (typeof value !== 'number' || value < 0)) {
          errors.push(`Invalid currency value: ${key}`);
        }

        if (varDef.validation && !varDef.validation.test(String(value))) {
          errors.push(`Validation failed for: ${key}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate FDCPA compliance
   */
  private validateFDCPACompliance(template: Template, variables: TemplateVariables): FDCPAValidation {
    const violations: string[] = [];

    // Check for required FDCPA elements
    if (template.category === 'debt_validation') {
      if (!template.content.includes('30 days')) {
        violations.push('Missing 30-day validation notice');
      }
      if (!template.content.includes('dispute')) {
        violations.push('Missing dispute rights notice');
      }
    }

    // Check for prohibited content
    const prohibitedPhrases = [
      'jail',
      'arrest',
      'criminal',
      'lawsuit' // without proper context
    ];

    const contentLower = template.content.toLowerCase();
    for (const phrase of prohibitedPhrases) {
      if (contentLower.includes(phrase)) {
        violations.push(`Potentially prohibited phrase: "${phrase}"`);
      }
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      checkedRules: template.complianceRules,
      timestamp: new Date(),
    };
  }

  /**
   * Format variable based on its type
   */
  private formatVariable(value: any, varDef: any): string {
    if (varDef.type === 'currency') {
      return `$${Number(value).toFixed(2)}`;
    }
    
    if (varDef.type === 'date') {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (varDef.mask && varDef.type === 'string') {
      // Mask sensitive data (e.g., account numbers)
      const str = String(value);
      return str.slice(0, -4).replace(/./g, '*') + str.slice(-4);
    }

    return String(value);
  }

  /**
   * Email validation
   */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Phone validation
   */
  private isValidPhone(phone: string): boolean {
    return /^[\d\s\-\(\)]+$/.test(phone);
  }

  /**
   * Get all available templates
   */
  getTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }
}

export const templateGenerator = new TemplateGeneratorAgent();
