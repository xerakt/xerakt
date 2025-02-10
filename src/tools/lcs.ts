export {
  //getLcs,//done: comment out; this function is for testing purposes only
  getLcsData,
};




//here is an LCS algorithm for arrays that contain only unique items among 1 array (e. g. DOM node can't appear more than once in parent node's childNodes)

//  LCS == Longest Common Subsequence




//function getLcsData is for figuring out the data that describes a longest common subsequence between itms0 and itms1

//to get an actual array with a longest common subsequence of itms0 and itms1, look to the comment below the function

function getLcsData<Itm>(

//intended to work correctly only if:
  //itms0[idx00] !== itms0[idx01] for each (
    //integer 0 <= idx00 < itms0.length,
    //integer 0 <= idx01 < itms0.length,
    //idx00 !== idx01
  //)
  //and
  //itms1[idx10] !== itms1[idx11] for each (
    //integer 0 <= idx10 < itms1.length,
    //integer 0 <= idx11 < itms1.length,
    //idx10 !== idx11
  //)

  itms0: ReadonlyArray<Itm>,
  itms1: ReadonlyArray<Itm>,


  //returns:
  //[
  //  [
  //    firstUnmatchingIdx,
  //    firstUnmatchingIdx,
  //  ],
  //  ...middleMatches,
  //  [
  //    afterLastUnmatchingIdx0,
  //    afterLastUnmatchingIdx1,
  //  ],
  //]

  //for every integer 0 <= idx < firstUnmatchingIdx, every itms0[idx] === itms1[idx]

  //for every integer offset >= 0, every itms0[afterLastUnmatchingIdx0 + offset] === itms1[afterLastUnmatchingIdx1 + offset]

  //middleMatches is an array that contains the indexes of the longest common subsequence of the itms0.slice(firstUnmatchingIdx, afterLastUnmatchingIdx0) and the itms1.slice(firstUnmatchingIdx, afterLastUnmatchingIdx1), with the items in the format [idx0, idx1], where idx0 is the index of the item in the itms0 array, and idx1 is the index in the itms1 array. All idx0s and all idx1s in the middleMatches array are strictly increasing, and the middleMatches array is a longest possible such array
): ReadonlyArray<LcsMatch> {

  // https://en.wikipedia.org/wiki/Longest_common_subsequence#Reduce_the_problem_set
  const [
    beforeFirstIdx,
    afterLastIdx0,
    afterLastIdx1,
  ] = getRangeOfUnmatchingItms(
    itms0,
    itms1
  );

  //record is an object with data about found match between itms0 and itms1
  //a regular record (hereinafter referred to as currentRecord, to distinguish it from similar ones with which it is somehow related) has following properties:
  //currentRecord.idx0 is an index of some item in itms0 and the currentRecord.idx1 is an index of the same item in itms1
  //records are arranged into a list that is sorted by idx1: currentRecord.nextRecord is pointing to a record with the closest greater idx1 than among all records that exist at this moment
  //currentRecord.nextSeqRecord is pointing to a record that is the next in a longest sequence with increasing indx1 and increasing idx0 among sequences that contain current record
  //currentRecord.nextPeak is pointing to a record (the "peak") with the farthest greater idx1 that is a head of a longest sequence with increasing idx1 and increasing idx0 among all the records with greater idx1 than currentRecord.idx1 (so this sequence doesn't contain current record nor any other records with idx1 lesser than idx1 of the "peak")
  //at first, only two placeholder records exist, all found records will be inserted between them (and never deleted from the list):

  const afterLastRecord: (
    AfterLastLcsRecord
  ) = {
    idx1: afterLastIdx1,
    nextRecord: null,
    nextSeqRecord: null,
  };
  const beforeFirstRecord: (
    BeforeFirstLcsRecord
  ) = {
    idx1: beforeFirstIdx,
    nextRecord: afterLastRecord,
    nextPeak: afterLastRecord,
  };

  //starting from the end of itms0:
  let idx0 = afterLastIdx0;

  loopOverIdx0: while (
    --idx0
    >
    beforeFirstIdx
  ) {

    //starting from the beginning of the list of the existing records:
    let prevRecord: (
      NonAfterLastLcsRecord
    ) = (
      beforeFirstRecord
    );
    let nextRecord: (
      NonBeforeFirstLcsRecord
    ) = (
      beforeFirstRecord.nextRecord
    );

    let nextPeak: (
      NonBeforeFirstLcsRecord
    ) = (
      beforeFirstRecord.nextPeak
    );

    //we are at start, we haven't seen any "peaks" yet, so putting a corresponding placeholder:
    let prevPeak: (
      NonAfterLastLcsRecord
    ) = (
      beforeFirstRecord
    );
    let prevPrevPeak: (
      NonAfterLastLcsRecord
    ) = (
      beforeFirstRecord
    );

    while (
      true
    ) {

      //in each iteration looking only between the current pair of adjacent records: prevRecord and nextRecord; a new record, if found, will be inserted between them:
      let idx1 = (
        prevRecord.idx1
      );
      const nextRecordIdx1 = (
        nextRecord.idx1
      );

      while (
        ++idx1
        <
        nextRecordIdx1
      ) {

        if (
          (
            itms0[idx0]
            ===
            itms1[idx1]
          )
        ) {
          //if found match:

          const currentRecord: (
            RegularLcsRecord
          ) = {

            //recording index of the matching item in itms0 and in itms1:
            idx0,
            idx1,

            //for inserting into the list:
            nextRecord: nextRecord,

            //nextPeak didn't change, because the defining sequence of the "peak" doesn't contain any items (such as currendRecord or prevRecord) with idx1 lesser than idx1 of the "peak", so when we create currendRecord, nothing should change:
            nextPeak: (
              nextPeak
            ),

            //current idx1 is lesser than idx1 of nextPeak by definition of the "peak"; current idx0 is lesser than idx0 of nextPeak because we are iterating backwards on idx0 and nextPeak was already created before (and can't have same idx0 since itms0[idx0] can't be equal to both itms1[currentRecord.idx1] and itms1[nextPeak.idx1], because indexes are not same and every item must be unique in itms1); so in a longest sequence with increasing idx1 and increasing idx0 that contain current record, the next record should be nextPeak, because both idx0 and idx1 are increasing and nextPeak is a starting point of such sequence, but not containing currentRecord, so it gives us the longest possible length of the sequence continuation:
            nextSeqRecord: (
              nextPeak
            ),
          };

          //for inserting into the list:
          prevRecord.nextRecord = (
            currentRecord
          );

          //now currentRecord is a "peak" (from a viewpoint of prevRecord) of a sequence that is one record longer than such of nextPeak; such sequence of prevPeak is also only one record longer than such of nextPeak, because if it was more than one record longer, there should have been other "peaks" between prevPeak and nextPeak (the proof of this is quite easy, but this comment would become too long if the proof was written here), and since records are sorted by idx1 and hence currentRecord.idx1 is greater than prevPeak.idx1, the prevPrevPeak.nextPeak by definition must be currentPeak instead of prevPeak:
          prevPrevPeak.nextPeak = (
            currentRecord
          );

          //we've found the corresponding idx1 for the current idx0, so proceeding to the next idx0:
          continue loopOverIdx0;
        };
      };

      //if we haven't found a match between prevRecord and nextRecord:

      if (nextRecord.nextRecord) {
        //afterLastRecord.nextRecord === null, so, if true (not null), we are not at the end, and need to prepare the next iteration:

        prevRecord = (
          nextRecord
        );
        nextRecord = (
          nextRecord.nextRecord
        );

        if (
          nextPeak
          ===
          prevRecord
        ) {
          //if we left the nextPeak behind (while preparing the next iteration), then we need another one:

          prevPrevPeak = prevPeak;
          prevPeak = nextPeak;
          nextPeak = nextPeak.nextPeak;
        };

      } else {
        //if we are at the end:

        continue loopOverIdx0;
        //continuing to the next iteration over idx0, causing the otherwise-infinite loop over prevRecord and nextRecord to break (because no more nextRecord left)
      };
    };
  };

  //after founding all matches:

  //creating an array for longest common subsequence in our search range:
  const matches: Array<
    LcsMatch
  > = [
    [
      beforeFirstIdx,
      beforeFirstIdx,
    ],
  ];

  //by definition, beforeFirstRecord.nextPeak is a head of a list of records of a longest common subsequence (because, by definition, it is a longest such list with both idx0 and idx1 increasing) among all recorded items with idx1 > beforeFirstRecord.idx1, and since beforeFirstRecord.idx1 === beforeFirstIdx, it is exactly our search range:
  let currentSeqRecord = (
    beforeFirstRecord.nextPeak
  );

  //iterating over this list to push all the index matches to our array:
  while (
    currentSeqRecord.nextSeqRecord
  ) {

    matches.push(
      [
        currentSeqRecord.idx0,
        currentSeqRecord.idx1,
      ]
    );

    currentSeqRecord = (
      currentSeqRecord.nextSeqRecord
    );
  };

  matches.push(
    [
      afterLastIdx0,
      afterLastIdx1,
    ]
  );

  //done:
  return matches;
};



/*
//done: block-comment out; this function is for testing purposes only

//to get an actual array with the longest common subsequence of two arrays you can use the function getLcs:

function getLcs<Itm>(
  itms0: ReadonlyArray<Itm>,
  itms1: ReadonlyArray<Itm>,
): ReadonlyArray<Itm> {

  const matches = getLcsData(
    itms0,
    itms1
  );

  //and then option 0:
  const actualLcs0 = [
    ...itms0.slice(
      0,
      matches[0][0] + 1
    ),
    ...matches.slice(1, -1).map(
      ([idx0, idx1]) => itms0[
        idx0
      ]
    ),
    ...itms0.slice(
      matches[
        matches.length - 1
      ][0]
    ),
  ];

  //or option 1:
  const actualLcs1 = [
    ...itms1.slice(
      0,
      matches[0][1] + 1
    ),
    ...matches.slice(1, -1).map(
      ([idx0, idx1]) => itms1[
        idx1
      ]
    ),
    ...itms1.slice(
      matches[
        matches.length - 1
      ][1]
    ),
  ];

  //option 0 and option 1 both give the same result:
  const isSame = (
    (
      actualLcs0.length
      ===
      actualLcs1.length
    )
    &&
    actualLcs0.every(
      (...[, idx]) => (
        actualLcs0[idx]
        ===
        actualLcs1[idx]
      )
    )
  ); //must be true:
  console.assert(
    isSame
  );

  //returning either one:
  return (
    Math.random() > 0.5
    ?
    actualLcs0
    :
    actualLcs1
  );
};
*/





// https://en.wikipedia.org/wiki/Longest_common_subsequence#Reduce_the_problem_set
function getRangeOfUnmatchingItms<Itm>(
  itms0: ReadonlyArray<Itm>,
  itms1: ReadonlyArray<Itm>,
) {

  const lengthOfItms0 = itms0.length;
  const lengthOfItms1 = itms1.length;

  //minified shorter than Math.min():
  const lesserLength = (
    lengthOfItms0 < lengthOfItms1
    ?
    lengthOfItms0
    :
    lengthOfItms1
  );


  let startMatchesLength = 0;

  while (
    (
      startMatchesLength
      <
      lesserLength
    )
    &&
    (
      itms0[startMatchesLength]
      ===
      itms1[startMatchesLength]
    )
  ) {
    startMatchesLength++
  };

  const lesserNonStartLength = (
    lesserLength
    -
    startMatchesLength
  );


  let endMatchesLength = 0;

  while (
    (
      endMatchesLength
      <
      lesserNonStartLength
    )
    &&
    (
      itms0[
        (lengthOfItms0 - 1)
        -
        endMatchesLength
      ]
      ===
      itms1[
        (lengthOfItms1 - 1)
        -
        endMatchesLength
      ]
    )
  ) {
    endMatchesLength++
  };

  const beforeFirstUnmatchingIdx = (
    startMatchesLength - 1
  );
  const afterLastUnmatchingIdx0 = (
    lengthOfItms0
    -
    endMatchesLength
  );
  const afterLastUnmatchingIdx1 = (
    lengthOfItms1
    -
    endMatchesLength
  );

  return [
    beforeFirstUnmatchingIdx,
    afterLastUnmatchingIdx0,
    afterLastUnmatchingIdx1,
  ] as const;
};





type AfterLastLcsRecord = (
  EveryLcsRecordProps
  &
  {
    nextRecord: null,
    readonly nextSeqRecord: null,
  }
);

type RegularLcsRecord = (
  EveryLcsRecordProps
  &
  NonAfterLastLcsRecordProps
  &
  {
    idx0: number,
    readonly nextSeqRecord: (
      NonBeforeFirstLcsRecord
    ),
  }
);

type BeforeFirstLcsRecord = (
  EveryLcsRecordProps
  &
  NonAfterLastLcsRecordProps
);

type NonAfterLastLcsRecordProps = {
  nextRecord: NonBeforeFirstLcsRecord,
  nextPeak: NonBeforeFirstLcsRecord,
};

type NonBeforeFirstLcsRecord = (
  AfterLastLcsRecord
  |
  RegularLcsRecord
);

type NonAfterLastLcsRecord = (
  RegularLcsRecord
  |
  BeforeFirstLcsRecord
);

type EveryLcsRecordProps = {
  idx1: number,
};

type LcsMatch = [
  idx0: number,
  idx1: number,
];