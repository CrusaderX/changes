interface IParserSuccessOutput {
  completed: true;
  files: string[];
}

interface IParserErrorOutput {
  completed: false;
  error: string;
}

export type IParserOutput = IParserSuccessOutput | IParserErrorOutput;

export type CommitFile = {
  additions: number;
  blob_url: string;
  changes: number;
  contents_url: string;
  deletions: number;
  filename: string;
  patch?: string;
  previous_filename?: string;
  raw_url: string;
  sha: string;
  status: string;
};
