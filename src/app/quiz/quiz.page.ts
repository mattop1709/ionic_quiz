import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuizService } from '../quiz.service';
import { FinalizedQuestion, Quiz } from 'src/app/interface/quiz';

const TOTAL_QUESTIONS = 10;

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
})
export class QuizPage implements OnInit, OnDestroy {
  quizes: any[] = [];
  isCompleted: boolean = false;
  questionNumber: number = 0;
  isDisabled: boolean = false;
  score: number = 0;
  subscription: Subscription;
  constructor(
    private quizService: QuizService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router
  ) {
    this.onFetchQuiz();
  }

  ngOnInit() {
    console.log(this.quizes);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async onFetchQuiz(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Downloading trivia...',
    });
    this.subscription = this.quizService
      .loadNewQuiz()
      .pipe(
        map((response: any) =>
          response.results.map((question: FinalizedQuestion) => ({
            ...question,
            answers: this.quizService.shuffleAnswer([
              ...question.incorrect_answers,
              question.correct_answer,
            ]),
          }))
        )
      )
      .subscribe(
        (questions: Quiz[]) => {
          this.quizes = questions;
        },
        error => console.error(error),
        () => {
          this.isCompleted = true;
          loading.dismiss();
        }
      );
    await loading.present();
  }

  onClickNext(): void {
    const numberOfQuestions = this.questionNumber + 1;
    if (numberOfQuestions === TOTAL_QUESTIONS) {
      this.onShowResult();
    } else {
      this.questionNumber++;
      this.isDisabled = false;
      // console.log(numberOfQuestions);
    }
  }

  onSelectAnswer(answer: string): void {
    this.isDisabled = true;
    let correctAnswer =
      this.quizes[this.questionNumber].correct_answer === answer;
    correctAnswer && this.score++;
  }

  getButtonCaption(): string {
    const finalQuestion = TOTAL_QUESTIONS - 1;
    if (this.questionNumber === finalQuestion) {
      return 'Finish';
    } else {
      return 'Next';
    }
  }

  async onShowResult(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Game Over!',
      message: `Thank your for participating, your result is ${this.score}`,
      buttons: [
        {
          text: 'Done',
          handler: () => {
            this.router.navigateByUrl('/');
          },
        },
      ],
    });

    await alert.present();
  }
}
