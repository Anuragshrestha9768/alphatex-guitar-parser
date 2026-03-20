/**
 * AlphaTex Guitar Track Extractor
 * Preserves header metadata and extracts only guitar tracks
 * Fixed TypeScript errors
 */

class AlphaTexGuitarParser {
  private readonly guitarKeywords: string[];

  constructor() {
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
    ];
  }

  public parse(alphaTexString: string): string {
    const lines = alphaTexString.split("\n");
    const result: string[] = [];

    let inHeader = true;
    let inTrack = false;
    let currentTrackHasGuitar = false;
    let currentTrack: string[] = [];
    let trackCount = 0;
    let guitarCount = 0;
    let headerContent: string[] = [];

    console.log("🎸 Scanning for guitar tracks...\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip if line is undefined
      if (line === undefined) continue;

      const trimmed = line.trim();

      if (
        trimmed.startsWith("\\track") ||
        trimmed.startsWith("[track]") ||
        trimmed.startsWith("TRACK")
      ) {
        inHeader = false;

        if (inTrack) {
          if (currentTrackHasGuitar) {
            result.push(...currentTrack);
            result.push("");
            guitarCount++;
            console.log(`✅ Track ${trackCount}: GUITAR - KEPT`);
          } else {
            console.log(`❌ Track ${trackCount}: Not guitar - SKIPPED`);
          }
        }

        inTrack = true;
        currentTrackHasGuitar = false;
        currentTrack = [line];
        trackCount++;

        if (this.isGuitarInstrument(line)) {
          currentTrackHasGuitar = true;
          console.log(`   Found guitar in track header`);
        }
      } else if (inHeader) {
        if (trimmed !== "") {
          headerContent.push(line);
        }
      } else if (inTrack) {
        if (
          trimmed.includes("instrument") &&
          this.isGuitarInstrument(trimmed)
        ) {
          currentTrackHasGuitar = true;
          console.log(`   Found guitar instrument: "${trimmed}"`);
        }
        currentTrack.push(line);
      }
    }

    if (inTrack) {
      if (currentTrackHasGuitar) {
        result.push(...currentTrack);
        guitarCount++;
        console.log(`✅ Track ${trackCount}: GUITAR - KEPT`);
      } else {
        console.log(`❌ Track ${trackCount}: Not guitar - SKIPPED`);
      }
    }

    const finalResult = [...headerContent, ...result];

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   Header lines preserved: ${headerContent.length}`);
    console.log(`   Total tracks: ${trackCount}`);
    console.log(`   Guitar tracks: ${guitarCount}`);
    console.log(`   Other tracks: ${trackCount - guitarCount}`);

    return finalResult.join("\n");
  }

  private isGuitarInstrument(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.guitarKeywords.some((keyword) =>
      lowerText.includes(keyword.toLowerCase()),
    );
  }
}

// Your a.tex content
const aTexContent = `\\artist "JerryC"
\\copyright ("Junior Antoneli" "Copyright %COPYRIGHT%" center)
\\subtitle "J & M Instituto Musical "
\\title "Canon Rock "
\\tab "junior Antoneli "
\\systemsLayout (3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 2)
\\bracketExtendMode groupsimilarinstruments
\\otherSystemsTrackNameOrientation horizontal

\\track ("Jerry" "E-Gt") {
  color "#CE4330"
  systemsLayout (8 5 2 2 3 3 3 3 4 5 5 5 5 5 3 3 2 3 3 3 3 3 3 3 2 4 3 1 3 4 2 3 3 2 4 2 3 3 3 3 3 3 4 5 3 2 2 2 1 1 2 2 2 3 3 3 3 2 2 3 2 1 2 4 1 2 5 4 5 1)
  volume 12
  balance 8
  instrument distortionguitar
}
  \\staff {
    score
    tabs
  }
    \\tuning (E4 B3 G3 D3 A2 E2) {
      label "Guitar Standard Tuning"
    }
    \\ts (4 4)
    \\beaming (8 2 2 2 2)
    \\tempo 90
    \\accidentals auto
    \\clef g2
    \\ottava regular
    \\simile none
    \\ks c
      12.2{v}.2{f dy f instrument distortionguitar beam Down}
      14.2{v acc #}.4{f beam Down}
      15.2.8{beam Down}
      17.2.8{beam Down}
    |
      14.1{v acc #}.2{beam Down}
      17.2.8{beam Down}
      15.1.8{beam Down}
      14.1{h acc #}.16{tu (3 2) beam Down}
      15.1{h}.16{tu (3 2) beam Down}
      14.1{acc #}.16{tu (3 2) beam Down}
      17.2.8{beam Down}
    |

\\track ("Cello" "S-Gt7") {
  color "#F64A26"
  systemsLayout (3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 2)
  volume 9
  balance 8
  instrument cello
}
  \\staff {
    score
    tabs
  }
    \\tuning (E4 B3 G3 D3 A2 E2 B1) {
      label "Guitar 7 strings"
    }
    \\displaytranspose 12
    \\clef g2
    \\ottava regular
    \\simile none
    \\ks c
      3.6{v}.2{dy f instrument cello}
      0.5{v}.2
    |

\\track ("Violin" "S-Gt") {
  color "#F64A26"
  systemsLayout (3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 2)
  volume 10
  balance 8
  instrument violin
}
  \\staff {
    score
    tabs
  }
    \\tuning (E4 B3 G3 D3 A2 E2) {
      label "Guitar Standard Tuning"
    }
    \\displaytranspose 12
    \\clef g2
    \\ottava regular
    \\simile none
    \\ks c
      (7.1 8.2 7.3 5.5 3.6).2{dy f instrument violin}
      (9.1{acc #} 10.2 9.3 0.5 12.6).2
    |

\\track ("Drumkit" "Drums") {
  color "#73B1DE"
  systemsLayout (3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 2)
  volume 12
  balance 8
  instrument percussion
}
  \\staff {
    score
  }
    \\articulation defaults
    \\clef neutral
    \\ottava regular
    \\simile none
    \\ks c
      r.4{dy mf}
      r.2{d}
    |
`;

function main(): void {
//   console.log("\n" + "🎸".repeat(10));
  console.log("   AlphaTex Guitar Track Extractor");
//   console.log("🎸".repeat(10) + "\n");

  const parser = new AlphaTexGuitarParser();
  const result = parser.parse(aTexContent);

  console.log("\n" + "=".repeat(50));
  console.log("📄 FINAL OUTPUT (Header + Guitar Tracks):");
  console.log("=".repeat(50));

  const lines = result.split("\n");
  const previewLines = lines.slice(0, 25);
  console.log(previewLines.join("\n"));

  if (lines.length > 25) {
    console.log(`\n... and ${lines.length - 25} more lines`);
  }

  console.log(`\n✅ Successfully extracted!`);
  console.log(`   Total output lines: ${lines.length}`);
}

main();
