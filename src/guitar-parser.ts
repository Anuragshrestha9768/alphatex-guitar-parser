/**
 * AlphaTex Guitar Track Extractor
 * Preserves header metadata and extracts a single selected guitar track
 */

interface ParserConfig {
  verbose?: boolean;
  customKeywords?: string[];
}

class AlphaTexGuitarParser {
  private readonly guitarKeywords: string[];
  private config: ParserConfig;

  constructor(config: ParserConfig = {}) {
    this.config = {
      verbose: true, // Default value
      ...config,
    };

    this.guitarKeywords = [
      "guitar",
      "e-gt",
      "s-gt",
      "distortion",
      "overdriven",
      "clean",
      "distortionguitar",
      "electric",
      "acoustic",
      "steel",
      "nylon",
      "jazz",
      "rock",
      "metal",
      "lead",
      "rhythm",
      "muted",
      "harmonics",
      "feedback",
      "chorus",
      "funk",
      "hawaiian",
      "mid tone",
      "pinch",
      "overdrive",
      "bass",
      "ukulele",
      "mandolin",
      "banjo",
      ...(config.customKeywords || []),
    ];
  }

  /**
   * Get list of all guitar tracks with their details
   */
  public listGuitarTracks(alphaTexString: string): Array<{
    number: number;
    name: string;
    instrument: string;
  }> {
    const tracks = this.parseTracks(alphaTexString);
    const guitarTracks = tracks.filter((track) =>
      this.isGuitarTrack(track.lines),
    );

    return guitarTracks.map((track, idx) => ({
      number: idx + 1,
      name: track.name,
      instrument: track.instrument,
    }));
  }

  /**
   * Extract a specific guitar track
   * @param alphaTexString - The AlphaTex content
   * @param selection - Track number (1-based) or name/partial name
   * @returns Extracted AlphaTex with header and selected track
   */
  public extractGuitarTrack(
    alphaTexString: string,
    selection: number | string,
  ): string {
    const tracks = this.parseTracks(alphaTexString);
    const guitarTracks = tracks.filter((track) =>
      this.isGuitarTrack(track.lines),
    );

    if (guitarTracks.length === 0) {
      throw new Error("No guitar tracks found in the AlphaTex content");
    }

    // Find selected track
    let selectedTrack;

    if (typeof selection === "number") {
      // Selection by number (1-based)
      if (selection >= 1 && selection <= guitarTracks.length) {
        selectedTrack = guitarTracks[selection - 1];
      }
    } else {
      // Selection by name (case-insensitive partial match)
      const lowerSel = selection.toLowerCase();
      selectedTrack = guitarTracks.find(
        (track) =>
          track.name.toLowerCase().includes(lowerSel) ||
          track.instrument.toLowerCase().includes(lowerSel),
      );
    }

    if (!selectedTrack) {
      this.showAvailableTracks(guitarTracks);
      throw new Error(
        `\n❌ Could not find guitar track matching: ${selection}`,
      );
    }

    if (this.config.verbose) {
      console.log(
        `\n✅ Extracted: ${selectedTrack.name} (${selectedTrack.instrument})`,
      );
    }

    // Extract header (everything before first track)
    const header = this.extractHeader(alphaTexString);

    // Combine header with selected track
    return [...header, ...selectedTrack.lines].join("\n");
  }

  // Private methods
  private parseTracks(alphaTexString: string): Array<{
    name: string;
    instrument: string;
    lines: string[];
    startLine: number;
  }> {
    const lines = alphaTexString.split("\n");
    const tracks: Array<{
      name: string;
      instrument: string;
      lines: string[];
      startLine: number;
    }> = [];

    let inTrack = false;
    let currentTrack: string[] = [];
    let currentTrackName = "";
    let currentTrackStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;

      const trimmed = line.trim();

      if (this.isTrackStart(trimmed)) {
        if (inTrack && currentTrack.length > 0) {
          tracks.push({
            name: currentTrackName,
            instrument: this.extractInstrumentInfo(currentTrack),
            lines: [...currentTrack],
            startLine: currentTrackStartLine,
          });
        }

        inTrack = true;
        currentTrack = [line];
        currentTrackStartLine = i;
        currentTrackName = this.extractTrackName(line);
      } else if (inTrack) {
        currentTrack.push(line);

        if (trimmed === "}") {
          tracks.push({
            name: currentTrackName,
            instrument: this.extractInstrumentInfo(currentTrack),
            lines: [...currentTrack],
            startLine: currentTrackStartLine,
          });
          inTrack = false;
          currentTrack = [];
        }
      }
    }

    return tracks;
  }

  private extractHeader(alphaTexString: string): string[] {
    const lines = alphaTexString.split("\n");
    const header: string[] = [];

    for (const line of lines) {
      if (line === undefined) continue;
      if (this.isTrackStart(line.trim())) {
        break;
      }
      header.push(line);
    }

    return header;
  }

  private isTrackStart(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return (
      lowerLine.startsWith("\\track") ||
      lowerLine.startsWith("[track]") ||
      lowerLine.startsWith("track")
    );
  }

  private isGuitarTrack(trackLines: string[]): boolean {
    return trackLines.some((line) => this.isGuitarInstrument(line));
  }

  private isGuitarInstrument(text: string): boolean {
    const lowerText = text.toLowerCase();

    // Check for explicit guitar
    if (lowerText.includes("guitar") && !lowerText.includes("piano")) {
      return true;
    }

    // Check keywords
    return this.guitarKeywords.some(
      (keyword) =>
        lowerText.includes(keyword) &&
        !lowerText.includes("piano") &&
        !lowerText.includes("drum") &&
        !lowerText.includes("flute") &&
        !lowerText.includes("violin"),
    );
  }

  private extractTrackName(line: string): string {
    const match = line.match(/\("([^"]+)"\s+"([^"]+)"\)/);
    if (match) {
      return `${match[1]} (${match[2]})`;
    }

    const simpleMatch = line.match(/track\s+"([^"]+)"/i);
    if (simpleMatch) {
      return simpleMatch[1];
    }

    return "Unknown Track";
  }

  private extractInstrumentInfo(trackLines: string[]): string {
    for (const line of trackLines) {
      if (line.toLowerCase().includes("instrument")) {
        const match = line.match(/instrument\s+([^\s{]+)/i);
        if (match) {
          return match[1];
        }
      }
    }
    return "Unknown";
  }

  private showAvailableTracks(
    tracks: Array<{
      number?: number;
      name: string;
      instrument: string;
    }>,
  ): void {
    console.log("\n🎸 Available guitar tracks:");
    tracks.forEach((track, idx) => {
      console.log(`   ${idx + 1}. ${track.name} (${track.instrument})`);
    });
    console.log("\nUsage:");
    console.log("   extractGuitarTrack(content, 1)        // Select by number");
    console.log("   extractGuitarTrack(content, 'Lead')   // Select by name");
  }
}

// Simple usage example
function main(): void {
  console.log("\n🎸 AlphaTex Guitar Track Extractor\n");

  const alphaTexContent = `\\artist "Guitar Ensemble"
\\copyright "Copyright 2024"
\\title "Guitar Concerto"

% Track 1: Lead Guitar
\\track ("Lead Guitar" "E-Gt") {
  instrument distortionguitar
}
  \\staff {
    score
  }
    12.2.2
  |

% Track 2: Acoustic Guitar
\\track ("Acoustic Guitar" "A-Gt") {
  instrument acoustic guitar
}
  \\staff {
    score
  }
    (3.2 2.2 0.2).4
  |

% Track 3: Piano
\\track ("Piano" "Pno") {
  instrument acoustic grand piano
}
  \\staff {
    score
  }
    c4 e g c'
  |
`;

  const parser = new AlphaTexGuitarParser({ verbose: true });

  try {
    // List available tracks
    console.log("Available tracks:");
    const tracks = parser.listGuitarTracks(alphaTexContent);
    tracks.forEach((track) => {
      console.log(`  ${track.number}. ${track.name} (${track.instrument})`);
    });

    // Extract by number
    console.log("\n--- Extracting track #1 ---");
    const result1 = parser.extractGuitarTrack(alphaTexContent, 2);
    console.log(result1);

    // Extract by name
    console.log("\n--- Extracting track by name 'Acoustic' ---");
    const result2 = parser.extractGuitarTrack(alphaTexContent, "Acoustic");
    console.log(result2);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
}

// Run
main();
