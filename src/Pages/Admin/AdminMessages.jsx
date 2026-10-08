import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  Search,
  RefreshCw,
  MessageCircle,
  Mail,
  Clock3,
  ChevronLeft,
  Loader2,
  AlertCircle,
  UserRound,
  BriefcaseBusiness,
  Radio,
} from "lucide-react";

// ======================================================
// API
// ======================================================

const API_BASE =
  "http://localhost/job_portal/job-portal-api/api/messages";

const CONVERSATIONS_API =
  `${API_BASE}/get-admin-conversations.php`;

// IMPORTANT:
// Admin ke liye dedicated endpoint.
// Isse admin candidate/recruiter ki identity use karke
// messages read nahi karega.
const MESSAGES_API =
  `${API_BASE}/get-admin-messages.php`;

const POLLING_TIME = 3000;

// ======================================================
// COMPONENT
// ======================================================

const AdminMessages = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  // ====================================================
  // URL PARAMS
  // ====================================================

  const urlCandidateId = Number(
    searchParams.get("candidateId") || 0
  );

  const urlRecruiterId = Number(
    searchParams.get("recruiterId") || 0
  );

  // ====================================================
  // STATES
  // ====================================================

  const [conversations, setConversations] =
    useState([]);

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loadingConversations, setLoadingConversations] =
    useState(false);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mobileChatOpen, setMobileChatOpen] =
    useState(false);

  // ====================================================
  // REFS
  // ====================================================

  const messagesEndRef =
    useRef(null);

  const selectedConversationRef =
    useRef(null);

  const pollingRef =
    useRef(null);

  const errorTimerRef =
    useRef(null);

  // ====================================================
  // KEEP SELECTED CONVERSATION REF UPDATED
  // ====================================================

  useEffect(() => {
    selectedConversationRef.current =
      selectedConversation;
  }, [selectedConversation]);

  // ====================================================
  // CLEANUP ERROR TIMER
  // ====================================================

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  // ====================================================
  // SHOW ERROR
  // ====================================================

  const showError = useCallback((message) => {
    setError(message || "Something went wrong.");

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }

    errorTimerRef.current = setTimeout(() => {
      setError("");
    }, 4000);
  }, []);

  // ====================================================
  // SCROLL TO BOTTOM
  // ====================================================

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 80);
  }, []);

  // ====================================================
  // SAFE DATE
  // ====================================================
  // MySQL:
  // 2026-09-29 14:30:00
  //
  // Browser friendly:
  // 2026-09-29T14:30:00
  // ====================================================

  const parseDate = useCallback((value) => {
    if (!value) {
      return null;
    }

    const stringValue = String(value);

    const normalized =
      stringValue.includes("T")
        ? stringValue
        : stringValue.replace(" ", "T");

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }, []);

  // ====================================================
  // FORMAT FULL DATE
  // ====================================================

  const formatDate = useCallback(
    (value) => {
      const date = parseDate(value);

      if (!date) {
        return "";
      }

      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [parseDate]
  );

  // ====================================================
  // FORMAT SHORT DATE
  // ====================================================

  const formatShortDate = useCallback(
    (value) => {
      const date = parseDate(value);

      if (!date) {
        return "";
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    },
    [parseDate]
  );

  // ====================================================
  // FORMAT MESSAGE DATE
  // ====================================================

  const getMessageDate = useCallback(
    (value) => {
      const date = parseDate(value);

      if (!date) {
        return "";
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
    [parseDate]
  );

  // ====================================================
  // FETCH ADMIN CONVERSATIONS
  // ====================================================

  const fetchConversations = useCallback(
    async ({
      showLoader = true,
      autoSelect = true,
    } = {}) => {
      try {
        if (showLoader) {
          setLoadingConversations(true);
        }

        let url =
          CONVERSATIONS_API;

        // ------------------------------------------------
        // Candidate filter
        // ------------------------------------------------

        if (urlCandidateId > 0) {
          url +=
            `?candidateId=${encodeURIComponent(
              urlCandidateId
            )}`;
        }

        const response =
          await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          });

        const raw =
          await response.text();

        let data;

        try {
          data = JSON.parse(raw);
        } catch {
          console.error(
            "Admin conversations raw response:",
            raw
          );

          throw new Error(
            "Invalid conversations response from server."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Server error: ${response.status}`
          );
        }

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Unable to load conversations."
          );
        }

        // ------------------------------------------------
        // Normalize list
        // ------------------------------------------------

        const list =
          Array.isArray(data.conversations)
            ? data.conversations
            : [];

        const normalized =
          list
            .map((item) => ({
              ...item,

              candidate_id: Number(
                item.candidate_id || 0
              ),

              recruiter_id: Number(
                item.recruiter_id || 0
              ),

              last_message_id: Number(
                item.last_message_id || 0
              ),

              last_message_sender_id: Number(
                item.last_message_sender_id || 0
              ),

              last_message_receiver_id: Number(
                item.last_message_receiver_id || 0
              ),

              candidate_name:
                item.candidate_name ||
                "Candidate",

              candidate_email:
                item.candidate_email ||
                "",

              recruiter_name:
                item.recruiter_name ||
                "Recruiter",

              recruiter_email:
                item.recruiter_email ||
                "",

              last_message:
                item.last_message ||
                "",

              last_message_time:
                item.last_message_time ||
                null,
            }))
            .filter(
              (item) =>
                item.candidate_id > 0 &&
                item.recruiter_id > 0
            );

        setConversations(normalized);

        // =================================================
        // KEEP CURRENT CONVERSATION
        // =================================================

        const current =
          selectedConversationRef.current;

        if (
          current?.candidate_id &&
          current?.recruiter_id
        ) {
          const updated =
            normalized.find(
              (item) =>
                Number(item.candidate_id) ===
                  Number(
                    current.candidate_id
                  ) &&
                Number(item.recruiter_id) ===
                  Number(
                    current.recruiter_id
                  )
            );

          if (updated) {
            setSelectedConversation(
              updated
            );

            return;
          }
        }

        // =================================================
        // DO NOT AUTO SELECT DURING POLLING
        // =================================================

        if (!autoSelect) {
          return;
        }

        // =================================================
        // URL CANDIDATE + RECRUITER
        // =================================================

        if (
          urlCandidateId > 0 &&
          urlRecruiterId > 0
        ) {
          const requested =
            normalized.find(
              (item) =>
                Number(item.candidate_id) ===
                  urlCandidateId &&
                Number(item.recruiter_id) ===
                  urlRecruiterId
            );

          if (requested) {
            setSelectedConversation(
              requested
            );

            setMobileChatOpen(true);

            return;
          }
        }

        // =================================================
        // URL CANDIDATE ONLY
        // =================================================

        if (urlCandidateId > 0) {
          const requested =
            normalized.find(
              (item) =>
                Number(item.candidate_id) ===
                urlCandidateId
            );

          if (requested) {
            setSelectedConversation(
              requested
            );

            setMobileChatOpen(true);

            return;
          }
        }

        // =================================================
        // FIRST CONVERSATION
        // =================================================

        if (normalized.length > 0) {
          setSelectedConversation(
            normalized[0]
          );

          setMobileChatOpen(true);

          return;
        }

        // =================================================
        // NOTHING
        // =================================================

        setSelectedConversation(null);
        setMessages([]);
      } catch (err) {
        console.error(
          "Admin conversations error:",
          err
        );

        showError(
          err?.message ||
            "Unable to load conversations."
        );
      } finally {
        if (showLoader) {
          setLoadingConversations(false);
        }
      }
    },
    [
      urlCandidateId,
      urlRecruiterId,
      showError,
    ]
  );

  // ====================================================
  // FETCH ADMIN MESSAGES
  // ====================================================

  const fetchMessages = useCallback(
    async (
      conversation,
      {
        showLoader = true,
        scroll = true,
      } = {}
    ) => {
      if (
        !conversation?.candidate_id ||
        !conversation?.recruiter_id
      ) {
        setMessages([]);
        return;
      }

      const candidateId =
        Number(
          conversation.candidate_id
        );

      const recruiterId =
        Number(
          conversation.recruiter_id
        );

      if (
        candidateId <= 0 ||
        recruiterId <= 0
      ) {
        setMessages([]);
        return;
      }

      try {
        if (showLoader) {
          setLoadingMessages(true);
        }

        // =================================================
        // IMPORTANT
        // Admin endpoint
        // =================================================

        const url =
          `${MESSAGES_API}?candidateId=${encodeURIComponent(
            candidateId
          )}` +
          `&recruiterId=${encodeURIComponent(
            recruiterId
          )}`;

        const response =
          await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          });

        const raw =
          await response.text();

        let data;

        try {
          data = JSON.parse(raw);
        } catch {
          console.error(
            "Admin messages raw response:",
            raw
          );

          throw new Error(
            "Invalid messages response from server."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Server error: ${response.status}`
          );
        }

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Unable to load messages."
          );
        }

        const list =
          Array.isArray(data.messages)
            ? data.messages
            : [];

        setMessages(list);

        if (scroll && list.length > 0) {
          scrollToBottom();
        }
      } catch (err) {
        console.error(
          "Admin messages error:",
          err
        );

        if (showLoader) {
          showError(
            err?.message ||
              "Unable to load messages."
          );
        }
      } finally {
        if (showLoader) {
          setLoadingMessages(false);
        }
      }
    },
    [
      scrollToBottom,
      showError,
    ]
  );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    fetchConversations({
      showLoader: true,
      autoSelect: true,
    });
  }, [fetchConversations]);

  // ====================================================
  // LOAD SELECTED CONVERSATION MESSAGES
  // ====================================================

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    fetchMessages(
      selectedConversation,
      {
        showLoader: true,
        scroll: true,
      }
    );
  }, [
    selectedConversation,
    fetchMessages,
  ]);

  // ====================================================
  // LIVE POLLING
  // ====================================================

  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(
        pollingRef.current
      );
    }

    pollingRef.current =
      setInterval(() => {
        // -----------------------------------------------
        // Update conversations
        // -----------------------------------------------

        fetchConversations({
          showLoader: false,
          autoSelect: false,
        });

        // -----------------------------------------------
        // Update selected chat
        // -----------------------------------------------

        const current =
          selectedConversationRef.current;

        if (
          current?.candidate_id &&
          current?.recruiter_id
        ) {
          fetchMessages(
            current,
            {
              showLoader: false,
              scroll: false,
            }
          );
        }
      }, POLLING_TIME);

    return () => {
      if (pollingRef.current) {
        clearInterval(
          pollingRef.current
        );

        pollingRef.current = null;
      }
    };
  }, [
    fetchConversations,
    fetchMessages,
  ]);

  // ====================================================
  // AUTO SCROLL WHEN MESSAGES CHANGE
  // ====================================================

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [
    messages,
    scrollToBottom,
  ]);

  // ====================================================
  // SELECT CONVERSATION
  // ====================================================

  const handleSelectConversation =
    useCallback(
      (conversation) => {
        if (
          !conversation?.candidate_id ||
          !conversation?.recruiter_id
        ) {
          return;
        }

        setSelectedConversation(
          conversation
        );

        setMobileChatOpen(true);

        // ----------------------------------------------
        // Update URL
        // ----------------------------------------------

        const params = {
          candidateId: String(
            conversation.candidate_id
          ),

          candidateName:
            conversation.candidate_name ||
            "Candidate",

          recruiterId: String(
            conversation.recruiter_id
          ),

          recruiterName:
            conversation.recruiter_name ||
            "Recruiter",
        };

        if (
          conversation.candidate_email
        ) {
          params.candidateEmail =
            conversation.candidate_email;
        }

        if (
          conversation.recruiter_email
        ) {
          params.recruiterEmail =
            conversation.recruiter_email;
        }

        setSearchParams(params);
      },
      [setSearchParams]
    );

  // ====================================================
  // FILTER CONVERSATIONS
  // ====================================================

  const filteredConversations =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return conversations;
      }

      return conversations.filter(
        (item) => {
          return (
            String(
              item.candidate_name || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              item.candidate_email || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              item.recruiter_name || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              item.recruiter_email || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              item.last_message || ""
            )
              .toLowerCase()
              .includes(value)
          );
        }
      );
    }, [
      conversations,
      search,
    ]);

  // ====================================================
  // ACTIVE CONVERSATION
  // ====================================================

  const isActive =
    useCallback(
      (conversation) => {
        if (!selectedConversation) {
          return false;
        }

        return (
          Number(
            selectedConversation.candidate_id
          ) ===
            Number(
              conversation.candidate_id
            ) &&
          Number(
            selectedConversation.recruiter_id
          ) ===
            Number(
              conversation.recruiter_id
            )
        );
      },
      [selectedConversation]
    );

  // ====================================================
  // CLOSE MOBILE CHAT
  // ====================================================

  const handleMobileBack =
    useCallback(() => {
      setMobileChatOpen(false);
    }, []);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      className="
        flex
        h-[calc(100vh-120px)]
        min-h-[600px]
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`
          w-full
          shrink-0
          border-r
          border-slate-200
          bg-white
          md:w-[350px]
          lg:w-[390px]

          ${
            mobileChatOpen
              ? "hidden md:flex md:flex-col"
              : "flex flex-col"
          }
        `}
      >
        {/* ==================================================
            SIDEBAR HEADER
        ================================================== */}

        <div
          className="
            border-b
            border-slate-200
            p-4
          "
        >
          <div
            className="
              mb-4
              flex
              items-center
              justify-between
            "
          >
            <div>
              <h1
                className="
                  text-lg
                  font-extrabold
                  text-slate-900
                "
              >
                Messages
              </h1>

              <p
                className="
                  text-xs
                  text-slate-500
                "
              >
                Candidate ↔ Recruiter
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchConversations({
                  showLoader: true,
                  autoSelect: false,
                })
              }
              disabled={
                loadingConversations
              }
              title="Refresh conversations"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                text-slate-500
                transition
                hover:border-blue-300
                hover:bg-blue-50
                hover:text-blue-600
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={16}
                className={
                  loadingConversations
                    ? "animate-spin"
                    : ""
                }
              />
            </button>
          </div>

          {/* SEARCH */}

          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-2.5
              focus-within:border-blue-400
              focus-within:bg-white
            "
          >
            <Search
              size={16}
              className="text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search candidate or recruiter..."
              className="
                w-full
                bg-transparent
                text-sm
                outline-none
                placeholder:text-slate-400
              "
            />
          </div>
        </div>

        {/* ==================================================
            CONVERSATION LIST
        ================================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
          "
        >
          {loadingConversations &&
          conversations.length === 0 ? (
            <div
              className="
                flex
                h-40
                items-center
                justify-center
              "
            >
              <Loader2
                size={25}
                className="
                  animate-spin
                  text-blue-600
                "
              />
            </div>
          ) : filteredConversations.length ===
            0 ? (
            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >
              <div
                className="
                  mb-3
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-50
                "
              >
                <MessageCircle
                  size={25}
                  className="text-blue-500"
                />
              </div>

              <h3
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                No conversations found
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Only candidates and recruiters
                who have exchanged messages
                appear here.
              </p>
            </div>
          ) : (
            filteredConversations.map(
              (conversation) => {
                const active =
                  isActive(
                    conversation
                  );

                return (
                  <button
                    key={`${conversation.candidate_id}-${conversation.recruiter_id}`}
                    type="button"
                    onClick={() =>
                      handleSelectConversation(
                        conversation
                      )
                    }
                    className={`
                      flex
                      w-full
                      gap-3
                      border-b
                      border-slate-100
                      p-4
                      text-left
                      transition

                      ${
                        active
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                      }
                    `}
                  >
                    {/* AVATAR */}

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-gradient-to-br
                        from-blue-500
                        to-indigo-600
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      {(
                        conversation.candidate_name ||
                        "C"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* DETAILS */}

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-2
                        "
                      >
                        <h3
                          className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-900
                          "
                        >
                          {
                            conversation.candidate_name
                          }
                        </h3>

                        <span
                          className="
                            shrink-0
                            text-[10px]
                            text-slate-400
                          "
                        >
                          {formatShortDate(
                            conversation.last_message_time
                          )}
                        </span>
                      </div>

                      {/* CANDIDATE */}

                      <p
                        className="
                          mt-1
                          truncate
                          text-[11px]
                          text-slate-500
                        "
                      >
                        <UserRound
                          size={10}
                          className="mr-1 inline"
                        />

                        Candidate
                      </p>

                      {/* RECRUITER */}

                      <p
                        className="
                          mt-1
                          truncate
                          text-[11px]
                          font-semibold
                          text-blue-600
                        "
                      >
                        <BriefcaseBusiness
                          size={10}
                          className="mr-1 inline"
                        />

                        {
                          conversation.recruiter_name
                        }
                      </p>

                      {/* LAST MESSAGE */}

                      <p
                        className="
                          mt-1
                          truncate
                          text-xs
                          text-slate-500
                        "
                      >
                        {
                          conversation.last_message ||
                          "No message"
                        }
                      </p>
                    </div>
                  </button>
                );
              }
            )
          )}
        </div>
      </aside>

      {/* ==================================================
          CHAT SECTION
      ================================================== */}

      <section
        className={`
          min-w-0
          flex-1
          flex-col
          bg-slate-50

          ${
            mobileChatOpen
              ? "flex"
              : "hidden md:flex"
          }
        `}
      >
        {!selectedConversation ? (
          // =================================================
          // EMPTY CHAT
          // =================================================

          <div
            className="
              flex
              h-full
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >
            <MessageCircle
              size={40}
              className="mb-4 text-blue-500"
            />

            <h2
              className="
                text-xl
                font-extrabold
                text-slate-900
              "
            >
              Select a conversation
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Select a real candidate-recruiter
              conversation.
            </p>
          </div>
        ) : (
          <>
            {/* ==================================================
                CHAT HEADER
            ================================================== */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-3
                border-b
                border-slate-200
                bg-white
                px-4
                py-3
                sm:px-6
              "
            >
              {/* MOBILE BACK */}

              <button
                type="button"
                onClick={
                  handleMobileBack
                }
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-slate-200
                  md:hidden
                "
                title="Back"
              >
                <ChevronLeft
                  size={18}
                />
              </button>

              {/* AVATAR */}

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-blue-500
                  to-indigo-600
                  text-sm
                  font-bold
                  text-white
                "
              >
                {(
                  selectedConversation.candidate_name ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              {/* INFO */}

              <div
                className="
                  min-w-0
                  flex-1
                "
              >
                <h2
                  className="
                    truncate
                    text-sm
                    font-extrabold
                    text-slate-900
                    sm:text-base
                  "
                >
                  {
                    selectedConversation.candidate_name
                  }
                </h2>

                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <Mail
                    size={12}
                    className="text-slate-400"
                  />

                  <span
                    className="
                      truncate
                      text-xs
                      text-slate-500
                    "
                  >
                    {
                      selectedConversation.candidate_email ||
                      "No email"
                    }
                  </span>
                </div>

                <p
                  className="
                    mt-1
                    flex
                    items-center
                    gap-1
                    text-xs
                    font-semibold
                    text-blue-600
                  "
                >
                  <BriefcaseBusiness
                    size={11}
                  />

                  {
                    selectedConversation.recruiter_name
                  }
                </p>
              </div>

              {/* LIVE */}

              <div
                className="
                  hidden
                  items-center
                  gap-2
                  rounded-full
                  bg-green-50
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  text-green-600
                  sm:flex
                "
              >
                <Radio size={12} />

                LIVE
              </div>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div
                className="
                  mx-4
                  mt-3
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-xs
                  text-red-700
                  sm:mx-6
                "
              >
                <AlertCircle
                  size={16}
                />

                <span className="break-words">
                  {error}
                </span>
              </div>
            )}

            {/* ==================================================
                MESSAGES
            ================================================== */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-4
                sm:p-6
              "
            >
              {loadingMessages ? (
                <div
                  className="
                    flex
                    h-full
                    items-center
                    justify-center
                  "
                >
                  <Loader2
                    size={28}
                    className="
                      animate-spin
                      text-blue-600
                    "
                  />
                </div>
              ) : messages.length === 0 ? (
                <div
                  className="
                    flex
                    h-full
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <MessageCircle
                    size={35}
                    className="
                      mb-3
                      text-blue-500
                    "
                  />

                  <h3
                    className="
                      text-sm
                      font-bold
                      text-slate-800
                    "
                  >
                    No messages
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    No messages found in this
                    conversation.
                  </p>
                </div>
              ) : (
                <div
                  className="
                    mx-auto
                    max-w-4xl
                    space-y-4
                  "
                >
                  {messages.map(
                    (message, index) => {
                      const candidateId =
                        Number(
                          selectedConversation.candidate_id
                        );

                      const recruiterId =
                        Number(
                          selectedConversation.recruiter_id
                        );

                      const senderId =
                        Number(
                          message.sender_id
                        );

                      const isRecruiter =
                        senderId ===
                        recruiterId;

                      const isCandidate =
                        senderId ===
                        candidateId;

                      const currentDate =
                        getMessageDate(
                          message.created_at
                        );

                      const previousDate =
                        index > 0
                          ? getMessageDate(
                              messages[
                                index - 1
                              ]?.created_at
                            )
                          : "";

                      return (
                        <React.Fragment
                          key={
                            message.id ||
                            `${message.created_at}-${index}`
                          }
                        >
                          {/* DATE SEPARATOR */}

                          {currentDate !==
                            previousDate && (
                            <div
                              className="
                                flex
                                justify-center
                                py-2
                              "
                            >
                              <span
                                className="
                                  rounded-full
                                  bg-white
                                  px-3
                                  py-1
                                  text-[10px]
                                  font-semibold
                                  text-slate-400
                                  shadow-sm
                                "
                              >
                                {currentDate}
                              </span>
                            </div>
                          )}

                          {/* MESSAGE */}

                          <div
                            className={`
                              flex
                              ${
                                isRecruiter
                                  ? "justify-end"
                                  : "justify-start"
                              }
                            `}
                          >
                            <div
                              className="
                                max-w-[90%]
                                sm:max-w-[70%]
                              "
                            >
                              {/* SENDER */}

                              <div
                                className={`
                                  mb-1
                                  text-[10px]
                                  font-semibold

                                  ${
                                    isRecruiter
                                      ? "text-right text-blue-600"
                                      : "text-left text-slate-500"
                                  }
                                `}
                              >
                                {isCandidate
                                  ? selectedConversation.candidate_name
                                  : isRecruiter
                                  ? selectedConversation.recruiter_name
                                  : message.sender_name ||
                                    "User"}
                              </div>

                              {/* MESSAGE BUBBLE */}

                              <div
                                className={`
                                  rounded-2xl
                                  px-4
                                  py-3
                                  shadow-sm

                                  ${
                                    isRecruiter
                                      ? "rounded-br-md bg-blue-600 text-white"
                                      : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                                  }
                                `}
                              >
                                <p
                                  className="
                                    whitespace-pre-wrap
                                    break-words
                                    text-sm
                                    leading-6
                                  "
                                >
                                  {
                                    message.message
                                  }
                                </p>
                              </div>

                              {/* TIME */}

                              <div
                                className={`
                                  mt-1
                                  flex
                                  items-center
                                  gap-1
                                  text-[10px]
                                  text-slate-400

                                  ${
                                    isRecruiter
                                      ? "justify-end"
                                      : "justify-start"
                                  }
                                `}
                              >
                                <Clock3
                                  size={10}
                                />

                                {formatDate(
                                  message.created_at
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    }
                  )}

                  <div
                    ref={
                      messagesEndRef
                    }
                  />
                </div>
              )}
            </div>

            {/* ==================================================
                ADMIN MONITOR FOOTER
            ================================================== */}

            <div
              className="
                shrink-0
                border-t
                border-slate-200
                bg-white
                px-4
                py-3
                sm:px-6
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                "
              >
                <MessageCircle
                  size={17}
                  className="
                    shrink-0
                    text-blue-500
                  "
                />

                <div className="min-w-0">
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-700
                    "
                  >
                    Live conversation monitoring
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      leading-5
                      text-slate-500
                    "
                  >
                    Recruiter and candidate messages
                    refresh automatically every 3 seconds.
                    Admin cannot send or impersonate messages.
                  </p>
                </div>

                <div
                  className="
                    ml-auto
                    hidden
                    shrink-0
                    rounded-full
                    bg-green-50
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    text-green-600
                    sm:block
                  "
                >
                  LIVE
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminMessages;