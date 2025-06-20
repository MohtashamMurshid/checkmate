declare module "@mrnima/tiktok-downloader" {
  interface DownloadResult {
    creator: string;
    status: boolean;
    result: {
      image: string;
      title: string;
      dl_link: {
        images?: string[] | false;
        download_mp4_1?: string;
        download_mp4_2?: string;
        download_mp4_hd?: string;
        download_mp3?: string;
        download_video?: boolean;
      };
    };
  }

  export function downloadTiktok(url: string): Promise<DownloadResult>;
}
