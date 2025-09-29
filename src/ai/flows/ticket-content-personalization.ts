// src/ai/flows/ticket-content-personalization.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for personalizing ticket content with a welcome message or health tip using GenAI.
 *
 * It includes:
 * - `personalizeTicketContent`: A function to personalize the ticket content.
 * - `PersonalizeTicketContentInput`: The input type for the `personalizeTicketContent` function.
 * - `PersonalizeTicketContentOutput`: The output type for the `personalizeTicketContent` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeTicketContentInputSchema = z.object({
  puskesmasName: z.string().describe('The name of the Puskesmas.'),
  queueNumber: z.string().describe('The queue number (e.g., A001).'),
  serviceName: z.string().describe('The name of the service (e.g., Loket A - Pasien Biasa).'),
  timestamp: z.string().describe('The timestamp of the ticket generation.'),
  patientName: z.string().describe("The patient's name."),
  patientAddress: z.string().describe("The patient's address."),
  patientPhone: z.string().optional().describe("The patient's phone number."),
});
export type PersonalizeTicketContentInput = z.infer<
  typeof PersonalizeTicketContentInputSchema
>;

const PersonalizeTicketContentOutputSchema = z.object({
  personalizedContent: z
    .string()
    .describe('The personalized ticket content including a welcome message or health tip.'),
});
export type PersonalizeTicketContentOutput = z.infer<
  typeof PersonalizeTicketContentOutputSchema
>;

export async function personalizeTicketContent(
  input: PersonalizeTicketContentInput
): Promise<PersonalizeTicketContentOutput> {
  return personalizeTicketContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeTicketContentPrompt',
  input: {schema: PersonalizeTicketContentInputSchema},
  output: {schema: PersonalizeTicketContentOutputSchema},
  prompt: `You are a helpful assistant that personalizes ticket content for a Puskesmas (community health center). Your goal is to generate an engaging and informative content, including a welcome message and a relevant health tip. The message should be no more than two sentences. Greet the patient by name.

Puskesmas Name: {{{puskesmasName}}}
Queue Number: {{{queueNumber}}}
Service Name: {{{serviceName}}}
Timestamp: {{{timestamp}}}
Patient Name: {{{patientName}}}

Personalized Content:`,
});

const personalizeTicketContentFlow = ai.defineFlow(
  {
    name: 'personalizeTicketContentFlow',
    inputSchema: PersonalizeTicketContentInputSchema,
    outputSchema: PersonalizeTicketContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
