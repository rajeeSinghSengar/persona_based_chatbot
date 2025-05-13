import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { AiChatService } from './services/ai-chat.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  userInput = '';
  response: any;
messages : any;
 
  constructor(private aiChat: AiChatService) {}

  async sendAIMessage(){
    if (!this.userInput.trim()) return;

  this.messages =   await this.aiChat.sendAIMessage(this.userInput)
  }
 
}
