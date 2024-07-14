import React, { useEffect, useState } from "react";
import GenerateUserKey from "./nillion/components/GenerateUserKey";
import CreateClient from "./nillion/components/CreateClient";
import * as nillion from "@nillion/client-web";

import { NillionClient, NadaValues } from "@nillion/client-web";
import StoreSecretForm from "./nillion/components/StoreSecretForm";
import StoreProgram from "./nillion/components/StoreProgramForm";
import ComputeForm from "./nillion/components/ComputeForm";
import ConnectionInfo from "./nillion/components/ConnectionInfo";

export default function Main() {
  const programName = "meeting_cost";
  const outputName = "total_cost";
  const partyName = "official";
  const [userkey, setUserKey] = useState<string | null>(null);
  const [client, setClient] = useState<NillionClient | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [storeIds, setStoreIds] = useState<string[]>(Array(11).fill(""));
  const [programId, setProgramId] = useState<string | null>(null);
  const [additionalComputeValues, setAdditionalComputeValues] =
    useState<NadaValues | null>(null);
  const [computeResult, setComputeResult] = useState<string | null>(null);

  useEffect(() => {
    if (userkey && client) {
      setUserId(client.user_id);
      setPartyId(client.party_id);
      const additionalComputeValues = new nillion.NadaValues();
      setAdditionalComputeValues(additionalComputeValues);
    }
  }, [userkey, client]);

  const handleNewStoredSecret = (
    index: number,
    secret: { storeId: string }
  ) => {
    const newStoreIds = [...storeIds];
    newStoreIds[index] = secret.storeId;
    setStoreIds(newStoreIds);
  };

  return (
    <div>
      <h1>Meeting Cost Calculator</h1>
      <p>
        Connect to Nillion with a user key, then follow the steps to store a
        program, store salaries, and compute the total meeting cost.
      </p>
      <ConnectionInfo client={client} userkey={userkey} />

      <h1>1. Connect to Nillion Client {client && " ✅"}</h1>
      <GenerateUserKey setUserKey={setUserKey} />

      {userkey && <CreateClient userKey={userkey} setClient={setClient} />}
      <br />
      <h1>2. Store Program {programId && " ✅"}</h1>
      {client && (
        <>
          <StoreProgram
            nillionClient={client}
            defaultProgram={programName}
            onNewStoredProgram={(program) => setProgramId(program.program_id)}
          />
        </>
      )}
      <br />
      <h1>
        3. Store Salaries and Meeting Duration{" "}
        {storeIds.every((id) => id) && " ✅"}
      </h1>
      {userId && programId && (
        <>
          {[...Array(10).keys()].map((i) => (
            <div key={i}>
              <h2>
                Store Yearly Salary {i + 1} {storeIds[i] && " ✅"}
              </h2>
              <StoreSecretForm
                secretName={`yearly_salary${i}`}
                onNewStoredSecret={(secret) => handleNewStoredSecret(i, secret)}
                nillionClient={client}
                secretType='SecretInteger'
                isLoading={false}
                itemName=''
                hidePermissions
                defaultUserWithComputePermissions={userId}
                defaultProgramIdForComputePermissions={programId}
              />
            </div>
          ))}
          <h2>Store Meeting Duration {storeIds[10] && " ✅"}</h2>
          <StoreSecretForm
            secretName={"meeting_duration"}
            onNewStoredSecret={(secret) => handleNewStoredSecret(10, secret)}
            nillionClient={client}
            secretType='SecretInteger'
            isLoading={false}
            itemName=''
            hidePermissions
            defaultUserWithComputePermissions={userId}
            defaultProgramIdForComputePermissions={programId}
          />
        </>
      )}
      <br />
      <h1>4. Compute {computeResult && " ✅"}</h1>
      {client &&
        programId &&
        storeIds.every((id) => id) &&
        partyId &&
        additionalComputeValues && (
          <ComputeForm
            nillionClient={client}
            programId={programId}
            additionalComputeValues={additionalComputeValues}
            storeIds={storeIds}
            inputParties={[{ partyName, partyId }]}
            outputParties={[{ partyName, partyId }]}
            outputName={outputName}
            onComputeProgram={(result) => setComputeResult(result.value)}
          />
        )}
      <br />
    </div>
  );
}
