interface IParserSuccessOutput {
  completed: true;
  files: string[];
}

interface IParserErrorOutput {
  completed: false;
  error: string;
}

export type IParserOutput = IParserSuccessOutput | IParserErrorOutput;
