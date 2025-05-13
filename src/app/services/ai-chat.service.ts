import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {lastValueFrom, Observable} from 'rxjs'
import { API_KEY} from '../environment';
import { hiteshPrompt } from '../prompts/hitesh_bot_prompt';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
 messages = [
  { role: 'system', content: hiteshPrompt }
];
  MAX_TURNS: any = 3;

  constructor(private http: HttpClient) { }

  private API_KEY = API_KEY
  private API_Url = 'https://openrouter.ai/api/v1/chat/completions'

  async sendAIMessage(userInput: string) {
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:4200', // Or your deployed URL
      'X-Title': 'Hitesh Chaudhary Chatbot'
    });
  this.messages.push({ role: 'user', content: userInput });
   // Check if history is too long → summarize
    if (this.messages.length > 20) {
      const summary = await this.getSummaryOfOldMessages(this.messages.slice(1, 10));
      this.messages = [
        { role: 'system', content: hiteshPrompt },
        { role: 'user', content: `Here is the conversation so far: ${summary}` },
        ...this.messages.slice(10)
      ];
    }
  const trimmedMessages = this.getTrimmedMessages();
  const body = {
    model: 'openrouter/auto',
    messages: trimmedMessages
  };

  this.http.post(this.API_Url, body, { headers })
    .subscribe((res: any) => {
      const reply = res.choices[0].message;
      console.log("reply ", reply)
      this.messages.push(reply); // keep growing the context
     console.log("messages ",this.messages)
    });
    return this.messages
}
  private getTrimmedMessages(){
    const nonSystemMessages = this.messages.filter(m => m.role !== 'system');
    const recent = nonSystemMessages.slice(-this.MAX_TURNS * 2);
    return [{ role: 'system', content: hiteshPrompt }, ...recent];
  }


   async getSummaryOfOldMessages(oldMessages: any): Promise<string> {
    const summaryPrompt = [
      { role: 'system', content: 'Summarize the following conversation in 3 lines in Hinglish for memory compression.' },
      ...oldMessages
    ];

    const body = {
      model: 'openrouter/auto',
      messages: summaryPrompt
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json'
    });

    const res: any = await lastValueFrom(this.http.post(this.API_Url, body, { headers }));
    return res.choices[0].message.content;
  }

}
