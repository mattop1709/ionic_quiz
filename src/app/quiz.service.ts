import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from 'src/app/interface/quiz';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  url =
    'https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple';
  constructor(private http: HttpClient) {}

  loadNewQuiz(): Observable<Quiz> {
    return this.http.get<Quiz>(this.url);
  }

  shuffleAnswer(answers: string[]): string[] {
    return [...answers].sort(() => Math.random() - 0.5);
  }
}
