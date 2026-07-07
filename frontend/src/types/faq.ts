export interface Faq {
  _id: string;
  question: string;
  answer: string;
  group?: string;
  displayOrder: number;
}
